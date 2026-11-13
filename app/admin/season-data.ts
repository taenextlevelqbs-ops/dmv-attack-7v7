export type Registration = { id:string; tryout_id:string; athlete_first_name:string; athlete_last_name:string; age_group:string; primary_position:string|null; school:string|null; status:string; referral_source:string|null; linked_athlete_id:string|null; linked_family_id:string|null; parent_email:string|null; parent_guardian_name:string|null; has_headshot:boolean; submitted_at:string };
export type Team = {id:string;name:string;age_group:string;season:string;coaches:string[]|null};
export type Assignment = {id:string;team_id:string;tryout_submission_id:string;roster_status:string};
export type SeasonData = {fetched_at:string;problems:string[];registrations:Registration[]|null;teams:Team[]|null;assignments:Assignment[]|null;family_count:number|null;athlete_count:number|null};
