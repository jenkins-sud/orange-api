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
    describe("View Entry (GET /patients/:patientid/journal/:journalid)", function () {
        // basic endpoint
        var show = function (journalId, patientId, accessToken) {
            var url = util.format("http://localhost:3000/v1/patients/%d/journal/%d", patientId, journalId);
            return chakram.get(url, auth.genAuthHeaders(accessToken));
        };

        // given a patient and user nested within the patient, create a new
        // journal entry for the patient based on the factory template, and then show the entry
        var showEntry = function (data, patient) {
            var create = Q.nbind(patient.createJournalEntry, patient);
            return fixtures.build("JournalEntry", data).then(function (entry) {
                entry.setData(data);
                return entry.getData();
            }).then(create).then(function (entry) {
                return show(entry._id, patient._id, patient.user.accessToken);
            });
        };
        // create patient and user and show them automatically
        var showOtherPatientEntry = function (access, data) {
            return patients.testOtherPatient({}, access).then(curry(showEntry)(data));
        };
        var showMyPatientEntry = function (data) {
            return patients.testMyPatient({}).then(curry(showEntry)(data));
        };

        // check it requires a valid user, patient and entry
        patients.itRequiresAuthentication(curry(show)(1));
        patients.itRequiresValidPatientId(curry(show)(1));
        common.itRequiresValidEntryId(show);

        it("should let me view entries for my patients", function () {
            return expect(showMyPatientEntry({})).to.be.a.journal.viewSuccess;
        });
        it("should let me view entries for patients shared read-only", function () {
            return expect(showOtherPatientEntry("read", {})).to.be.a.journal.viewSuccess;
        });
        it("should let me view entries for patients shared read-write", function () {
            return expect(showOtherPatientEntry("write", {})).to.be.a.journal.viewSuccess;
        });
        it("should not let me view entries for patients not shared with me", function () {
            return expect(showOtherPatientEntry("none", {})).to.be.an.api.error(403, "unauthorized");
        });
    });
});
