# Project README

## Overview
This project is a comprehensive School Management System designed to facilitate the management of schools, administrators, classrooms, and students. The system is built to streamline administrative tasks, provide easy access to information, and ensure smooth operations within educational institutions.

## Server URL
https://seahorse-app-8v932.ondigitalocean.app/

## Demo Superadmin Credentials
- **Email**: admin@website.com
- **Password**: admin@2022

## API Endpoints

**Note**: Every endpoint requires an authentication token in the request header.
```json
{
    "headers": {
        "token": "token"
    },
}
```

### Response Format

Responses from the API will be in one of the following formats:

1. **Successful response with data:**
    ```json
    {
        "ok": true,
        "data": { "school": {} },
        "errors": [],
        "message": ""
    }
    ```

2. **Error response with a message:**
    ```json
    {
        "ok": false,
        "data": {},
        "errors": [],
        "message": "message"
    }
    ```

3. **Error response with errors:**
    ```json
    {
        "ok": false,
        "data": {},
        "errors": [{ "label": "label" }, { "label": "label" }],
        "message": ""
    }
    ```

### Root: /api

#### Path: /user

- **Endpoint: /v1_login**
  - **Description**: Handles user login and returns authentication tokens.
  - **Input**:
    - `email`: string - The user's email address.
    - `password`: string - The user's password.
  - **Output**:
    - `longToken`: string - The authentication token for the user.

#### Path: /token

- **Endpoint: /v1_createShortToken**
  - **Description**: Creates a short-term token required to communicate with the server.
  - **Output**:
    - `shortToken`: string - The generated short-term token.

#### Path: /school

- **Endpoint: /v1_list**
  - **Permission**: superadmin, admin
  - **Description**: Retrieves a list of schools.
  - **Output**:
    - `schools`: array - A list of schools with their names, contact information, and addresses.

- **Endpoint: /v1_create**
  - **Permission**: superadmin
  - **Description**: Creates a new school.
  - **Input**:
    - `name`: string - The name of the new school.
    - `address`: { street:string, city:string, state:string, country:string } - The address of the new school.
    - `contactInfo`: { email:string, phone?:string, website?:string } - The contact information for the new school.
  - **Output**:
    - `school`: object - The created school object with its ID, name, contact information, and address.

- **Endpoint: /v1_delete**
  - **Permission**: superadmin
  - **Description**: Deletes a school.
  - **Input**:
    - `schoolId`: string - The unique identifier of the school to be deleted.

- **Endpoint: /v1_enrollAdmin**
  - **Permission**: superadmin
  - **Description**: Enrolls an admin to a school.
  - **Input**:
    - `adminId`: string - The unique identifier of the admin to be enrolled.
    - `schoolId`: string - The unique identifier of the school.

- **Endpoint: /v1_unenrollAdmin**
  - **Permission**: superadmin
  - **Description**: Unenrolls an admin from a school.
  - **Input**:
    - `adminId`: string - The unique identifier of the admin to be unenrolled.
    - `schoolId`: string - The unique identifier of the school.

#### Path: /admin

- **Endpoint: /v1_list**
  - **Permission**: superadmin
  - **Description**: Retrieves a list of school admins.
  - **Output**:
    - `schooladmins`: array - A list of school admins with their names and email addresses.

- **Endpoint: /v1_create**
  - **Permission**: superadmin
  - **Description**: Creates a new school admin.
  - **Input**:
    - `name`: string - The name of the new school admin.
    - `email`: string - The email address of the new school admin.
    - `password`: string - The password for the new school admin's account.
  - **Output**:
    - `schooladmin`: object - The created school admin object.

- **Endpoint: /v1_delete**
  - **Permission**: superadmin
  - **Description**: Deletes a school admin.
  - **Input**:
    - `adminId`: string - The unique identifier of the school admin to be deleted.

#### Path: /classroom

- **Endpoint: /v1_list**
  - **Permission**: superadmin, admin, student
  - **Description**: Retrieves a list of classrooms.
  - **Input**:
    - `schoolId`: string - The unique identifier of the school.
  - **Output**:
    - `classrooms`: array - A list of classrooms with their names, schedules, and school IDs.

- **Endpoint: /v1_create**
  - **Permission**: superadmin, admin
  - **Description**: Creates a new classroom.
  - **Input**:
    - `schoolId`: string - The unique identifier of the school.
    - `name`: string - The name of the new classroom.
    - `schedule`: { day:string, startTime:string, endTime:string } - The schedule for the new classroom.
  - **Output**:
    - `classroom`: object - The created classroom object with its ID, name, schedule, and school ID.

- **Endpoint: /v1_delete**
  - **Permission**: superadmin, admin
  - **Description**: Deletes a classroom.
  - **Input**:
    - `classroomId`: string - The unique identifier of the classroom to be deleted.

- **Endpoint: /v1_enrollStudent**
  - **Permission**: superadmin, admin
  - **Description**: Enrolls a student in a classroom.
  - **Input**:
    - `classroomId`: string - The unique identifier of the classroom.
    - `studentId`: string - The unique identifier of the student to be enrolled.

- **Endpoint: /v1_unenrollStudent**
  - **Permission**: superadmin, admin
  - **Description**: Unenrolls a student from a classroom.
  - **Input**:
    - `classroomId`: string - The unique identifier of the classroom.
    - `studentId`: string - The unique identifier of the student to be unenrolled.

#### Path: /student

- **Endpoint: /v1_list**
  - **Permission**: superadmin, admin
  - **Description**: Retrieves a list of students.
  - **Output**:
    - `students`: array - A list of students.

- **Endpoint: /v1_create**
  - **Permission**: superadmin, admin
  - **Description**: Creates a new student.
  - **Input**:
    - `schoolId`: string - The unique identifier of the school.
    - `name`: string - The name of the new student.
    - `email`: string - The email address of the new student.
    - `password`: string - The password for the new student account.

- **Endpoint: /v1_delete**
  - **Permission**: superadmin, admin
  - **Description**: Deletes a student.
  - **Input**:
    - `studentId`: string - The unique identifier of the student to be deleted.
   
