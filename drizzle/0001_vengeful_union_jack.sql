CREATE TABLE `crmActivities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int,
	`dealId` int,
	`contactId` int,
	`type` varchar(32) NOT NULL,
	`title` varchar(180) NOT NULL,
	`body` text,
	`ownerName` varchar(120),
	`occurredAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `crmActivities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `crmCompanies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(160) NOT NULL,
	`segment` varchar(64) NOT NULL,
	`industry` varchar(96),
	`location` varchar(120),
	`ownerName` varchar(120),
	`status` varchar(32) NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `crmCompanies_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `crmContacts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int,
	`name` varchar(120) NOT NULL,
	`email` varchar(240),
	`phone` varchar(48),
	`role` varchar(120),
	`ownerName` varchar(120),
	`status` varchar(32) NOT NULL DEFAULT 'active',
	`lastContactAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `crmContacts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `crmDeals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int,
	`contactId` int,
	`title` varchar(180) NOT NULL,
	`stage` varchar(48) NOT NULL DEFAULT 'qualification',
	`amount` int NOT NULL DEFAULT 0,
	`probability` int NOT NULL DEFAULT 10,
	`ownerName` varchar(120) NOT NULL,
	`nextAction` varchar(180),
	`closeDate` timestamp,
	`status` varchar(32) NOT NULL DEFAULT 'open',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `crmDeals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `crmDocuments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int,
	`dealId` int,
	`type` varchar(32) NOT NULL,
	`number` varchar(48) NOT NULL,
	`status` varchar(32) NOT NULL DEFAULT 'draft',
	`amount` int NOT NULL DEFAULT 0,
	`dueDate` timestamp,
	`issuedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `crmDocuments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `crmNotifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`kind` varchar(32) NOT NULL,
	`title` varchar(180) NOT NULL,
	`body` text,
	`isRead` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `crmNotifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `crmTasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int,
	`dealId` int,
	`title` varchar(180) NOT NULL,
	`assignee` varchar(120) NOT NULL,
	`status` varchar(32) NOT NULL DEFAULT 'open',
	`priority` varchar(24) NOT NULL DEFAULT 'normal',
	`kind` varchar(48) NOT NULL DEFAULT 'follow-up',
	`dueAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `crmTasks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` varchar(16) NOT NULL DEFAULT 'user';