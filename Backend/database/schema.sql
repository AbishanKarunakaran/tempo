CREATE TABLE IF NOT EXISTS Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    preferred_language VARCHAR(50) DEFAULT 'English',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Violation Table
CREATE TABLE IF NOT EXISTS Violations (
    violation_id INT AUTO_INCREMENT PRIMARY KEY,
    violation_type VARCHAR(255) NOT NULL UNIQUE
);

INSERT IGNORE INTO Violations (violation_type) VALUES 
('Illegal waste disposal'),
('Air pollution'),
('Water pollution'),
('Deforestation'),
('Noise pollution');

-- Create Authority Table
CREATE TABLE IF NOT EXISTS Authorities (
    authority_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    region VARCHAR(255),
    last_active TIMESTAMP NULL
);

-- Create Complaint Table
CREATE TABLE IF NOT EXISTS Complaints (
    complaint_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    violation_type VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'Not Viewed',
    report_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_authority_id INT,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE SET NULL,
    FOREIGN KEY (assigned_authority_id) REFERENCES Authorities(authority_id) ON DELETE SET NULL
);

-- Create Location Table
CREATE TABLE IF NOT EXISTS Locations (
    location_id INT AUTO_INCREMENT PRIMARY KEY,
    complaint_id INT NOT NULL,
    location_name VARCHAR(255),
    longitude DECIMAL(10, 8),
    latitude DECIMAL(10, 8),
    district VARCHAR(255),
    FOREIGN KEY (complaint_id) REFERENCES Complaints(complaint_id) ON DELETE CASCADE
);

-- Create Evidence Table
CREATE TABLE IF NOT EXISTS Evidences (
    evidence_id INT AUTO_INCREMENT PRIMARY KEY,
    complaint_id INT NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_url MEDIUMTEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (complaint_id) REFERENCES Complaints(complaint_id) ON DELETE CASCADE
);

-- Create StatusUpdate Table
CREATE TABLE IF NOT EXISTS StatusUpdates (
    status_update_id INT AUTO_INCREMENT PRIMARY KEY,
    complaint_id INT NOT NULL,
    updated_by_authority_id INT,
    status VARCHAR(100) NOT NULL,
    description TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (complaint_id) REFERENCES Complaints(complaint_id) ON DELETE CASCADE,
    FOREIGN KEY (updated_by_authority_id) REFERENCES Authorities(authority_id) ON DELETE SET NULL
);

-- Create Reminder Table
CREATE TABLE IF NOT EXISTS Reminders (
    reminder_id INT AUTO_INCREMENT PRIMARY KEY,
    complaint_id INT UNIQUE NOT NULL,
    scheduled_date TIMESTAMP,
    sent_status BOOLEAN DEFAULT FALSE,
    recipient_authority_id INT,
    FOREIGN KEY (complaint_id) REFERENCES Complaints(complaint_id) ON DELETE CASCADE,
    FOREIGN KEY (recipient_authority_id) REFERENCES Authorities(authority_id) ON DELETE SET NULL
);

ALTER TABLE Complaints ADD COLUMN description TEXT;

-- New columns for Complaints
ALTER TABLE Complaints ADD COLUMN user_email VARCHAR(255) NULL;
ALTER TABLE Complaints ADD COLUMN violation_id_string VARCHAR(100) NULL UNIQUE;
ALTER TABLE Complaints ADD COLUMN parent_complaint_id INT NULL;
ALTER TABLE Complaints ADD CONSTRAINT fk_parent_complaint FOREIGN KEY (parent_complaint_id) REFERENCES Complaints(complaint_id) ON DELETE CASCADE;

-- New columns for Authorities
ALTER TABLE Authorities ADD COLUMN registration_certificate VARCHAR(1024) NULL;
ALTER TABLE Authorities ADD COLUMN status ENUM('Pending Verification', 'Approved', 'Rejected', 'Suspended') DEFAULT 'Pending Verification';
ALTER TABLE Authorities ADD COLUMN rejection_reason TEXT NULL;
ALTER TABLE Authorities ADD COLUMN failed_login_attempts INT DEFAULT 0;
ALTER TABLE Authorities ADD COLUMN locked_until TIMESTAMP NULL;
ALTER TABLE Authorities ADD COLUMN google_id VARCHAR(255) NULL UNIQUE;


-- Create OtpVerifications Table
CREATE TABLE IF NOT EXISTS OtpVerifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    otp VARCHAR(10) NOT NULL,
    purpose VARCHAR(50) NOT NULL, -- e.g., 'REPORT', 'REGISTRATION', 'PASSWORD_RESET'
    expires_at TIMESTAMP NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Admins Table
CREATE TABLE IF NOT EXISTS Admins (
    admin_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    failed_login_attempts INT DEFAULT 0,
    locked_until TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

