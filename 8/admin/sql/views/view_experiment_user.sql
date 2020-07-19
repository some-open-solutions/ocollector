DROP VIEW IF EXISTS `view_experiment_users`;
CREATE VIEW `view_experiment_users` AS (
SELECT  `exp`.`experiment_id` AS `experiment_id`,
				`exp`.`location` AS `location`,  
				`ub`.`email` AS `email`,
    			`cb`.`contributor_status` as `contributor_status`
	FROM (((`experiments` `exp`  
		JOIN `contributors` `cb`  ON ((`exp`.`experiment_id` = `cb`.`experiment_id`)))  
		JOIN `users` `ub`  ON ((`cb`.`user_id` = `ub`.`user_id`)))))