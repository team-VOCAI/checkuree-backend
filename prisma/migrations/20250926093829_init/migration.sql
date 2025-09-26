-- CreateTable
CREATE TABLE "public"."USERS" (
    "userId" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" DATE NOT NULL,
    "deletedAt" DATE,

    CONSTRAINT "USERS_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "public"."BOOKS" (
    "bookId" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "availableFrom" TEXT NOT NULL,
    "availableTo" TEXT NOT NULL,
    "availableDays" TEXT[],
    "courses" INTEGER[],

    CONSTRAINT "BOOKS_pkey" PRIMARY KEY ("bookId")
);

-- CreateTable
CREATE TABLE "public"."ATTENDEES" (
    "attendeeId" SERIAL NOT NULL,
    "bookId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "actualName" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "birthDate" DATE NOT NULL,
    "enrollmentDate" DATE NOT NULL,
    "school" TEXT NOT NULL,
    "isBeginner" BOOLEAN NOT NULL,
    "address_1" TEXT NOT NULL,
    "initialGradeId" INTEGER NOT NULL,
    "gradeId" INTEGER NOT NULL,
    "associates" TEXT[],
    "description" TEXT,
    "status" TEXT NOT NULL,
    "schedules" TEXT[],
    "progress" TEXT[],

    CONSTRAINT "ATTENDEES_pkey" PRIMARY KEY ("attendeeId")
);

-- CreateTable
CREATE TABLE "public"."COURSES" (
    "courseId" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "subjectItemId" INTEGER NOT NULL,

    CONSTRAINT "COURSES_pkey" PRIMARY KEY ("courseId")
);

-- CreateTable
CREATE TABLE "public"."GRADES" (
    "gradeId" SERIAL NOT NULL,
    "courseId" INTEGER NOT NULL,
    "level" INTEGER NOT NULL,

    CONSTRAINT "GRADES_pkey" PRIMARY KEY ("gradeId")
);

-- CreateTable
CREATE TABLE "public"."CURRICULUMS" (
    "curriculumId" SERIAL NOT NULL,
    "attendeeId" INTEGER NOT NULL,
    "gradeId" INTEGER NOT NULL,
    "startedAt" DATE NOT NULL,
    "endedAt" DATE,

    CONSTRAINT "CURRICULUMS_pkey" PRIMARY KEY ("curriculumId")
);

-- CreateTable
CREATE TABLE "public"."RECORDS" (
    "recordId" SERIAL NOT NULL,
    "attendeeId" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "startedAt" TEXT NOT NULL,
    "endAt" TEXT NOT NULL,
    "attendance" BOOLEAN NOT NULL,
    "status" TEXT NOT NULL,
    "isTaught" BOOLEAN NOT NULL,

    CONSTRAINT "RECORDS_pkey" PRIMARY KEY ("recordId")
);

-- CreateTable
CREATE TABLE "public"."COUNSELLING" (
    "counsellingId" SERIAL NOT NULL,
    "attendeeId" INTEGER NOT NULL,
    "counseleeId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "topics" TEXT[],
    "counsellingAt" DATE NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "COUNSELLING_pkey" PRIMARY KEY ("counsellingId")
);

-- CreateTable
CREATE TABLE "public"."COUNSELEES" (
    "counseleeId" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "COUNSELEES_pkey" PRIMARY KEY ("counseleeId")
);

-- CreateTable
CREATE TABLE "public"."FILES" (
    "fileId" SERIAL NOT NULL,
    "bookId" INTEGER NOT NULL,
    "kind" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "extension" TEXT NOT NULL,
    "needThumbnail" BOOLEAN NOT NULL,

    CONSTRAINT "FILES_pkey" PRIMARY KEY ("fileId")
);

-- CreateTable
CREATE TABLE "public"."REPORTS" (
    "reportId" SERIAL NOT NULL,
    "attendeeId" INTEGER NOT NULL,
    "reportYear" INTEGER NOT NULL,
    "reportMonth" INTEGER NOT NULL,
    "additionalContext" TEXT,

    CONSTRAINT "REPORTS_pkey" PRIMARY KEY ("reportId")
);

-- CreateIndex
CREATE UNIQUE INDEX "USERS_username_key" ON "public"."USERS"("username");

-- CreateIndex
CREATE UNIQUE INDEX "BOOKS_title_key" ON "public"."BOOKS"("title");

-- AddForeignKey
ALTER TABLE "public"."BOOKS" ADD CONSTRAINT "BOOKS_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."USERS"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ATTENDEES" ADD CONSTRAINT "ATTENDEES_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "public"."BOOKS"("bookId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ATTENDEES" ADD CONSTRAINT "ATTENDEES_initialGradeId_fkey" FOREIGN KEY ("initialGradeId") REFERENCES "public"."GRADES"("gradeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ATTENDEES" ADD CONSTRAINT "ATTENDEES_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES "public"."GRADES"("gradeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GRADES" ADD CONSTRAINT "GRADES_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."COURSES"("courseId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CURRICULUMS" ADD CONSTRAINT "CURRICULUMS_attendeeId_fkey" FOREIGN KEY ("attendeeId") REFERENCES "public"."ATTENDEES"("attendeeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CURRICULUMS" ADD CONSTRAINT "CURRICULUMS_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES "public"."GRADES"("gradeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RECORDS" ADD CONSTRAINT "RECORDS_attendeeId_fkey" FOREIGN KEY ("attendeeId") REFERENCES "public"."ATTENDEES"("attendeeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."COUNSELLING" ADD CONSTRAINT "COUNSELLING_attendeeId_fkey" FOREIGN KEY ("attendeeId") REFERENCES "public"."ATTENDEES"("attendeeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."COUNSELLING" ADD CONSTRAINT "COUNSELLING_counseleeId_fkey" FOREIGN KEY ("counseleeId") REFERENCES "public"."COUNSELEES"("counseleeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."COUNSELEES" ADD CONSTRAINT "COUNSELEES_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."USERS"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FILES" ADD CONSTRAINT "FILES_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "public"."BOOKS"("bookId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."REPORTS" ADD CONSTRAINT "REPORTS_attendeeId_fkey" FOREIGN KEY ("attendeeId") REFERENCES "public"."ATTENDEES"("attendeeId") ON DELETE RESTRICT ON UPDATE CASCADE;
