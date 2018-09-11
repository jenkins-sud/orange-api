#!/bin/sh

printf "\n\n\n\n**** RUNNING build.sh ********************\n\n"

# Set DTR for Docker - Perform against ALL Dockerfiles in your project
# /usr/bin/perl -i -pe "s|%%DTR_PREFIX%%|$DTR_PREFIX|" Dockerfile || { echo "FATAL: Could not set DTR Prefix"; exit 1; }
# /usr/bin/perl -i -pe "s|%%DTR_ORG%%|$DTR_ORG|" Dockerfile || { echo "FATAL: Could not set DTR Ogranization'"; exit 1; }

# Modifying the image name for PPG Automation 3.0
# sed -i '/image:/s/$/:\${SOURCE_BUILD_NUMBER}/' docker-compose.yml

# Dependency Check
printf "\n\n**** Mandatory: Dependency Checks ********************\n"

#npm install || { echo "FATAL: Failed on 'npm install'"; exit 1; } 

# Functional, Integration, Unit and Acceptance Tests
printf "\n\n**** Mandatory: Testing ********************\n"

#grunt test || { echo "FATAL: Failed on 'grunt test'"; exit 1; } 

# Build Artifact Production
printf "\n\n**** Optional: Producing Build Artifacts ********************\n"

#tar -zcvf $JOB_NAME.BUILD-$BUILD_NUMBER.tar.gz lib node_modules assets fonts images static views app.js package.json run.js gruntfile.js build.sh config.js Dockerfile docker-compose.yml || { echo "FATAL: Failed on 'Artifact tar''"; exit 1; }

tar -cvf $JOB_NAME-$BUILD_NUMBER.tar lib assets fonts images static views app.js .env.docker package.json run.js gruntfile.js config.js || { echo "FATAL: Failed on 'Artifact tar' 1/3'"; exit 1; }
tar -rvf ${JOB_NAME}-${BUILD_NUMBER}.tar -C deploy/mae build.sh Dockerfile docker-compose.yml app.yml pre-deploy.sh app.env || { echo "FATAL: Failed on 'Artifact tar' 2/3'"; exit 1;}
gzip ${JOB_NAME}-${BUILD_NUMBER}.tar || { echo "FATAL: Failed on 'Artifact tar' 3/3"; exit 1;}

printf "\n\n\n\n**** COMPLETED build.sh ********************\n\n" 
