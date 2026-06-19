-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Appointment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clinicId" TEXT NOT NULL DEFAULT 'demo',
    "patientId" TEXT NOT NULL,
    "dentistId" TEXT NOT NULL,
    "serviceId" TEXT,
    "datetime" DATETIME NOT NULL,
    "durationMin" INTEGER NOT NULL DEFAULT 30,
    "status" TEXT NOT NULL DEFAULT 'agendado',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Appointment_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Appointment_dentistId_fkey" FOREIGN KEY ("dentistId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Appointment_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Appointment" ("createdAt", "datetime", "dentistId", "durationMin", "id", "notes", "patientId", "serviceId", "status", "updatedAt") SELECT "createdAt", "datetime", "dentistId", "durationMin", "id", "notes", "patientId", "serviceId", "status", "updatedAt" FROM "Appointment";
DROP TABLE "Appointment";
ALTER TABLE "new_Appointment" RENAME TO "Appointment";
CREATE INDEX "Appointment_datetime_idx" ON "Appointment"("datetime");
CREATE INDEX "Appointment_dentistId_idx" ON "Appointment"("dentistId");
CREATE INDEX "Appointment_status_idx" ON "Appointment"("status");
CREATE INDEX "Appointment_patientId_idx" ON "Appointment"("patientId");
CREATE TABLE "new_Exam" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clinicId" TEXT NOT NULL DEFAULT 'demo',
    "patientId" TEXT NOT NULL,
    "dentistId" TEXT,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "notes" TEXT,
    "date" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pendente',
    "filePath" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Exam_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Exam_dentistId_fkey" FOREIGN KEY ("dentistId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Exam" ("createdAt", "date", "dentistId", "description", "filePath", "id", "notes", "patientId", "status", "type", "updatedAt") SELECT "createdAt", "date", "dentistId", "description", "filePath", "id", "notes", "patientId", "status", "type", "updatedAt" FROM "Exam";
DROP TABLE "Exam";
ALTER TABLE "new_Exam" RENAME TO "Exam";
CREATE INDEX "Exam_patientId_idx" ON "Exam"("patientId");
CREATE INDEX "Exam_status_idx" ON "Exam"("status");
CREATE TABLE "new_Patient" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clinicId" TEXT NOT NULL DEFAULT 'demo',
    "name" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "rg" TEXT,
    "birthdate" DATETIME NOT NULL,
    "gender" TEXT,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "cep" TEXT,
    "address" TEXT,
    "city" TEXT,
    "uf" TEXT DEFAULT 'SP',
    "status" TEXT NOT NULL DEFAULT 'ativo',
    "planId" TEXT,
    "allergies" TEXT NOT NULL DEFAULT '[]',
    "conditions" TEXT NOT NULL DEFAULT '[]',
    "observations" TEXT,
    "isMinor" BOOLEAN NOT NULL DEFAULT false,
    "responsibleParty" TEXT,
    "responsiblePhone" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Patient_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Patient" ("address", "allergies", "birthdate", "cep", "city", "conditions", "cpf", "createdAt", "email", "gender", "id", "isMinor", "name", "observations", "phone", "planId", "responsibleParty", "responsiblePhone", "rg", "status", "uf", "updatedAt") SELECT "address", "allergies", "birthdate", "cep", "city", "conditions", "cpf", "createdAt", "email", "gender", "id", "isMinor", "name", "observations", "phone", "planId", "responsibleParty", "responsiblePhone", "rg", "status", "uf", "updatedAt" FROM "Patient";
DROP TABLE "Patient";
ALTER TABLE "new_Patient" RENAME TO "Patient";
CREATE UNIQUE INDEX "Patient_cpf_key" ON "Patient"("cpf");
CREATE INDEX "Patient_status_idx" ON "Patient"("status");
CREATE INDEX "Patient_planId_idx" ON "Patient"("planId");
CREATE TABLE "new_Plan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clinicId" TEXT NOT NULL DEFAULT 'demo',
    "name" TEXT NOT NULL,
    "coveragePercent" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'ativo',
    "gracePeriod" TEXT,
    "color" TEXT,
    "serviceCount" INTEGER NOT NULL DEFAULT 0,
    "serviceIds" TEXT NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Plan" ("color", "coveragePercent", "createdAt", "gracePeriod", "id", "name", "serviceCount", "serviceIds", "status", "updatedAt") SELECT "color", "coveragePercent", "createdAt", "gracePeriod", "id", "name", "serviceCount", "serviceIds", "status", "updatedAt" FROM "Plan";
DROP TABLE "Plan";
ALTER TABLE "new_Plan" RENAME TO "Plan";
CREATE TABLE "new_Service" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clinicId" TEXT NOT NULL DEFAULT 'demo',
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" REAL NOT NULL DEFAULT 0,
    "duration" INTEGER NOT NULL DEFAULT 30,
    "category" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Service" ("category", "createdAt", "description", "duration", "id", "name", "price", "updatedAt") SELECT "category", "createdAt", "description", "duration", "id", "name", "price", "updatedAt" FROM "Service";
DROP TABLE "Service";
ALTER TABLE "new_Service" RENAME TO "Service";
CREATE INDEX "Service_category_idx" ON "Service"("category");
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clinicId" TEXT NOT NULL DEFAULT 'demo',
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'DENTIST',
    "specialty" TEXT,
    "color" TEXT,
    "initials" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("active", "color", "createdAt", "email", "id", "initials", "name", "passwordHash", "role", "specialty", "updatedAt") SELECT "active", "color", "createdAt", "email", "id", "initials", "name", "passwordHash", "role", "specialty", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "User_role_idx" ON "User"("role");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
