-- SQL to create `library` database and tables for the Library Management API
-- Run this on your MySQL server (e.g., via mysql cli or the migrate script)

CREATE DATABASE IF NOT EXISTS `library` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `library`;

-- Authors
CREATE TABLE IF NOT EXISTS `authors` (
  `id` CHAR(36) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Books
CREATE TABLE IF NOT EXISTS `books` (
  `id` CHAR(36) NOT NULL,
  `title` VARCHAR(500) NOT NULL,
  `author_id` CHAR(36) NOT NULL,
  `available` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_books_author` (`author_id`),
  CONSTRAINT `fk_books_author` FOREIGN KEY (`author_id`) REFERENCES `authors`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Members
CREATE TABLE IF NOT EXISTS `members` (
  `id` CHAR(36) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Loans
CREATE TABLE IF NOT EXISTS `loans` (
  `id` CHAR(36) NOT NULL,
  `book_id` CHAR(36) NOT NULL,
  `member_id` CHAR(36) NOT NULL,
  `borrowed_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `returned_at` DATETIME NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_loans_book` (`book_id`),
  KEY `idx_loans_member` (`member_id`),
  CONSTRAINT `fk_loans_book` FOREIGN KEY (`book_id`) REFERENCES `books`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_loans_member` FOREIGN KEY (`member_id`) REFERENCES `members`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
