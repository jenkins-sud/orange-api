"use strict";
var chakram         = require("chakram"),
    util            = require("util"),
    curry           = require("curry"),
    Q               = require("q"),
    auth            = require("../common/auth.js"),
    patients        = require("../patients/common.js"),
    fixtures        = require("./fixtures.js"),
    common          = require("./common.js");

var expect = chakram.expect;

describe("Journal", function () {
    describe("Update Entry (PUT /patients/:patientid/journal/:journalid)", function () {
        // basic endpoint
        var update = function (modifications, journalId, patientId, accessToken) {
            var url = util.format("http://localhost:3000/v1/patients/%d/journal/%d", patientId, journalId);
            return chakram.put(url, modifications, auth.genAuthHeaders(accessToken));
        };

        // given a patient and user nested within the patient, create a new
        // journal entry for the patient based on the factory template, and then try and update
        // the entry with the given modifications
        var updateEntry = function (modifications, data, patient) {
            var create = Q.nbind(patient.createJournalEntry, patient);
            return fixtures.build("JournalEntry", data).then(function (entry) {
                entry.setData(data);
                return entry.getData();
            }).then(create).then(function (entry) {
                return update(modifications, entry._id, patient._id, patient.user.accessToken);
            });
        };
        // create patient and user and modify them automatically
        var updateOtherPatientEntry = function (access, data, modifications) {
            return patients.testOtherPatient({}, access).then(curry(updateEntry)(modifications, data));
        };
        var updateMyPatientEntry = function (data, modifications) {
            return patients.testMyPatient({}).then(curry(updateEntry)(modifications, data));
        };

        // check it requires a valid user, patient and entry
        patients.itRequiresAuthentication(curry(update)({}, 1));
        patients.itRequiresValidPatientId(curry(update)({}, 1));
        common.itRequiresValidEntryId(curry(update)({}));

        it("should let me edit entries for my patients", function () {
            return expect(updateMyPatientEntry({}, {})).to.be.a.journal.success;
        });
        it("should let me edit entries for patients shared read-write", function () {
            return expect(updateOtherPatientEntry("write", {}, {})).to.be.a.journal.success;
        });
        it("should not let me edit entries for patients shared read-only", function () {
            return expect(updateOtherPatientEntry("read", {}, {})).to.be.an.api.error(403, "unauthorized");
        });
        it("should not let me edit entries for patients not shared with me", function () {
            return expect(updateOtherPatientEntry("none", {}, {})).to.be.an.api.error(403, "unauthorized");
        });

        // validations
        it("doesn't require any fields", function () {
            return expect(updateMyPatientEntry({}, {})).to.be.a.journal.success;
        });
        it("allows all fields", function () {
            return expect(updateMyPatientEntry({}, {
                date: (new Date()).toISOString(),
                text: "test date",
                medication_ids: [],
                mood: "so so sad"
            })).to.be.a.journal.success;
        });
        it("rejects blank text", function () {
            return expect(updateMyPatientEntry({}, {
                text: ""
            })).to.be.an.api.error(400, "text_required");
        });
        it("rejects blank dates", function () {
            return expect(updateMyPatientEntry({}, {
                date: ""
            })).to.be.an.api.error(400, "date_required");
        });
        it("rejects invalid dates", function () {
            return expect(updateMyPatientEntry({}, {
                date: "foobar"
            })).to.be.an.api.error(400, "invalid_date");
        });
        it("allows a blank mood", function () {
            return expect(updateMyPatientEntry({}, {
                mood: ""
            })).to.be.a.journal.success;
        });
        it("ignores a passed hashtags field", function () {
            return updateMyPatientEntry({
                text: "#test"
            }, {
                hashtags: ["example"]
            }).then(function (response) {
                expect(response).to.be.a.journal.success;
                expect(response.body.hashtags).to.deep.equal(["test"]);
            });
        });
        it("updates hashtags", function () {
            return updateMyPatientEntry({
                text: "#test"
            }, {
                text: "#example"
            }).then(function (response) {
                expect(response).to.be.a.journal.success;
                expect(response.body.hashtags).to.deep.equal(["example"]);
            });
        });
        it("allows no medication IDs", function () {
            return expect(updateMyPatientEntry({}, {
                medication_ids: []
            })).to.be.a.journal.success;
        });
        it("rejects invalid medication IDs", function () {
            return expect(updateMyPatientEntry({}, {
                medication_ids: ["foo"]
            })).to.be.an.api.error(400, "invalid_medication_id");
        });
        describe("with medications", function () {
            var patient;
            before(function () {
                // setup user and medication
                // setup current user and two patients for them, both with a medication
                return auth.createTestUser()
                .then(curry(patients.createMyPatient)({}))
                .then(function (p) {
                    patient = p;
                })
                .then(function () {
                    var med1 = Q.nbind(patient.createMedication, patient)({ name: "foobar" });
                    var med2 = Q.nbind(patient.createMedication, patient)({ name: "foobar" });
                    return med1.then(med2);
                });
            });

            it("allows valid medication IDs", function () {
                var ep = updateEntry({
                    medication_ids: [patient.medications[0]._id]
                }, {}, patient);
                return expect(ep).to.be.a.journal.success;
            });
            it("replaces medication IDs rather than combining", function () {
                var id1 = patient.medications[0]._id;
                var id2 = patient.medications[1]._id;
                var ep = updateEntry({
                    medication_ids: [id2]
                }, {
                    medication_ids: [id1]
                }, patient);
                return ep.then(function (response) {
                    expect(response).to.be.a.journal.success;
                    expect(response.body.medication_ids).to.deep.equal([id2]);
                });
            });
        });
    });
});