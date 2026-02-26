-- ============================================================
--  Campus Catalyst — MySQL Schema
--  Run this file to create all tables in the correct order
-- ============================================================

CREATE DATABASE IF NOT EXISTS campus_catalyst
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE campus_catalyst;

-- ─── Users ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            INT          NOT NULL AUTO_INCREMENT,
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(100) NOT NULL UNIQUE,
  password_hash TEXT         NOT NULL,
  role          ENUM('student', 'admin') NOT NULL DEFAULT 'student',
  university    VARCHAR(150) NULL,
  avatar_url    TEXT         NULL,
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_users_email (email),
  INDEX idx_users_role  (role)
) ENGINE=InnoDB;

-- ─── Notes ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notes (
  id            INT          NOT NULL AUTO_INCREMENT,
  title         VARCHAR(200) NOT NULL,
  subject       VARCHAR(100) NOT NULL,
  category      VARCHAR(100) NOT NULL,
  description   TEXT         NULL,
  file_url      TEXT         NOT NULL,
  uploader_id   INT          NOT NULL,
  downloads     INT          NOT NULL DEFAULT 0,
  likes         INT          NOT NULL DEFAULT 0,
  is_approved   BOOLEAN      NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_notes_subject     (subject),
  INDEX idx_notes_category    (category),
  INDEX idx_notes_uploader    (uploader_id),
  INDEX idx_notes_is_approved (is_approved),
  CONSTRAINT fk_notes_uploader FOREIGN KEY (uploader_id)
    REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ─── Note Likes ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS note_likes (
  id         INT       NOT NULL AUTO_INCREMENT,
  note_id    INT       NOT NULL,
  user_id    INT       NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_note_like (note_id, user_id),
  CONSTRAINT fk_nl_note FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
  CONSTRAINT fk_nl_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ─── Roommate Profiles ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS roommate_profiles (
  id              INT       NOT NULL AUTO_INCREMENT,
  user_id         INT       NOT NULL UNIQUE,
  sleep_schedule  ENUM('early', 'night_owl', 'flexible') NOT NULL,
  cleanliness     TINYINT   NOT NULL CHECK (cleanliness BETWEEN 1 AND 5),
  study_habits    ENUM('quiet', 'music', 'social') NOT NULL,
  smoking         BOOLEAN   NOT NULL DEFAULT FALSE,
  pets            BOOLEAN   NOT NULL DEFAULT FALSE,
  budget_range    VARCHAR(50) NULL,
  bio             TEXT      NULL,
  is_active       BOOLEAN   NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_rp_is_active (is_active),
  CONSTRAINT fk_rp_user FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ─── Roommate Matches ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS roommate_matches (
  id          INT           NOT NULL AUTO_INCREMENT,
  user1_id    INT           NOT NULL,
  user2_id    INT           NOT NULL,
  match_score DECIMAL(5, 2) NOT NULL,
  status      ENUM('pending', 'accepted', 'rejected') NOT NULL DEFAULT 'pending',
  created_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_match_pair (user1_id, user2_id),
  INDEX idx_rm_user1  (user1_id),
  INDEX idx_rm_user2  (user2_id),
  INDEX idx_rm_status (status),
  CONSTRAINT fk_rm_user1 FOREIGN KEY (user1_id)
    REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_rm_user2 FOREIGN KEY (user2_id)
    REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ─── Tasks ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tasks (
  id          INT       NOT NULL AUTO_INCREMENT,
  title       VARCHAR(200) NOT NULL,
  description TEXT      NULL,
  assigned_to INT       NULL,
  created_by  INT       NOT NULL,
  status      ENUM('pending', 'in_progress', 'done') NOT NULL DEFAULT 'pending',
  due_date    DATE      NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_tasks_assigned  (assigned_to),
  INDEX idx_tasks_status    (status),
  INDEX idx_tasks_due_date  (due_date),
  CONSTRAINT fk_tasks_assigned FOREIGN KEY (assigned_to)
    REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_tasks_creator FOREIGN KEY (created_by)
    REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;