-- Horse Racing Tournament Management System - demo seed data
-- Chay sau schema.sql:
--   psql -d horse_racing -f database/seed.sql

BEGIN;

-- ---------------------------------------------------------------------------
-- Users and role profiles
-- Password demo dang de plain text trong cot password_hash cho de test.
-- Khi lam that can hash bang bcrypt/argon2.
-- ---------------------------------------------------------------------------
INSERT INTO users (id, full_name, email, password_hash, phone, role, status, date_of_birth, address) VALUES
  ('u_admin', 'Admin User', 'admin@race.test', 'admin123', '0900000001', 'admin', 'active', '1990-01-01', 'Ho Chi Minh City'),
  ('u_owner_1', 'Sterling Stables', 'owner@race.test', 'owner123', '0900000002', 'owner', 'active', '1985-04-12', 'Kentucky'),
  ('u_owner_2', 'Blue River Ranch', 'owner2@race.test', 'owner123', '0900000003', 'owner', 'active', '1981-08-18', 'Da Nang'),
  ('u_owner_3', 'Golden Hooves Club', 'owner3@race.test', 'owner123', '0900000004', 'owner', 'pending', '1992-03-21', 'Ha Noi'),
  ('u_jockey_1', 'Marcus Sterling', 'jockey@race.test', 'jockey123', '0900000005', 'jockey', 'active', '1998-09-09', 'Churchill Downs'),
  ('u_jockey_2', 'Diego Martinez', 'diego@race.test', 'diego123', '0900000006', 'jockey', 'active', '1997-11-17', 'Mexico City'),
  ('u_jockey_3', 'Sarah Chen', 'sarah@race.test', 'sarah123', '0900000007', 'jockey', 'active', '1999-06-05', 'Singapore'),
  ('u_jockey_4', 'Emily Johnson', 'emily@race.test', 'emily123', '0900000008', 'jockey', 'pending', '2000-02-14', 'Melbourne'),
  ('u_jockey_hkjc_1', 'Derek Leung Ka-chun', 'derek.leung@race.test', 'jockey123', '0900000014', 'jockey', 'active', '1988-12-31', 'Hong Kong'),
  ('u_jockey_hkjc_2', 'Angus Chung Yik-lai', 'angus.chung@race.test', 'jockey123', '0900000015', 'jockey', 'active', '1996-10-02', 'Hong Kong'),
  ('u_jockey_hkjc_3', 'Zac Purton', 'zac.purton@race.test', 'jockey123', '0900000016', 'jockey', 'active', '1983-01-03', 'Hong Kong'),
  ('u_referee_1', 'Olivia Grant', 'referee@race.test', 'referee123', '0900000009', 'referee', 'active', '1979-10-10', 'Louisville'),
  ('u_referee_2', 'Noah Brooks', 'noah.ref@race.test', 'referee123', '0900000010', 'referee', 'active', '1982-12-01', 'Can Tho'),
  ('u_owner_hkjc_1', 'HKJC Racing Club Limited', 'hkjc.racing.club@race.test', 'owner123', '0900000017', 'owner', 'active', NULL, 'Hong Kong'),
  ('u_owner_hkjc_2', 'Peter Young Wai Po', 'peter.young@race.test', 'owner123', '0900000018', 'owner', 'active', '1975-04-18', 'Hong Kong'),
  ('u_owner_hkjc_3', 'Mr & Mrs Yan Qing Lin', 'yan.qing.lin@race.test', 'owner123', '0900000019', 'owner', 'active', NULL, 'Hong Kong'),
  ('u_owner_hkjc_4', 'Cheng Yu Wai Partnership', 'cheng.partnership@race.test', 'owner123', '0900000020', 'owner', 'active', NULL, 'Hong Kong'),
  ('u_spectator_1', 'Spectator User', 'spectator@race.test', 'spectator123', '0900000011', 'spectator', 'active', '2001-01-01', 'Ho Chi Minh City'),
  ('u_spectator_2', 'Linh Tran', 'linh@race.test', 'spectator123', '0900000012', 'spectator', 'active', '2002-05-23', 'Hue'),
  ('u_spectator_3', 'Minh Pham', 'minh@race.test', 'spectator123', '0900000013', 'spectator', 'active', '2003-07-30', 'Nha Trang');

INSERT INTO permissions (id, code, name, description) VALUES
  ('perm_user_manage', 'USER_MANAGE', 'Quan ly tai khoan', 'Admin quan ly tai khoan va phan quyen'),
  ('perm_tournament_manage', 'TOURNAMENT_MANAGE', 'Quan ly giai dau', 'Admin tao va cap nhat giai dau'),
  ('perm_horse_register', 'HORSE_REGISTER', 'Dang ky ngua', 'Owner tao va dang ky ho so ngua'),
  ('perm_jockey_invite', 'JOCKEY_INVITE', 'Moi jockey', 'Owner moi jockey dieu khien ngua'),
  ('perm_jockey_confirm', 'JOCKEY_CONFIRM', 'Xac nhan loi moi', 'Jockey phan hoi loi moi va race assignment'),
  ('perm_referee_result', 'REFEREE_RESULT', 'Xac nhan ket qua', 'Referee kiem tra va xac nhan ket qua'),
  ('perm_prediction', 'PREDICTION_CREATE', 'Du doan ket qua', 'Spectator du doan top race'),
  ('perm_report_view', 'REPORT_VIEW', 'Xem bao cao', 'Xem bao cao giai dau');

INSERT INTO role_permissions (role, permission_id) VALUES
  ('admin', 'perm_user_manage'),
  ('admin', 'perm_tournament_manage'),
  ('admin', 'perm_report_view'),
  ('owner', 'perm_horse_register'),
  ('owner', 'perm_jockey_invite'),
  ('owner', 'perm_report_view'),
  ('jockey', 'perm_jockey_confirm'),
  ('jockey', 'perm_report_view'),
  ('referee', 'perm_referee_result'),
  ('referee', 'perm_report_view'),
  ('spectator', 'perm_prediction'),
  ('spectator', 'perm_report_view');

INSERT INTO owner_profiles (id, user_id, stable_name, business_license_no, verification_status) VALUES
  ('op_001', 'u_owner_1', 'Sterling Stables', 'OWN-KY-001', 'approved'),
  ('op_002', 'u_owner_2', 'Blue River Ranch', 'OWN-VN-002', 'approved'),
  ('op_003', 'u_owner_3', 'Golden Hooves Club', 'OWN-VN-003', 'pending'),
  ('op_hkjc_001', 'u_owner_hkjc_1', 'HKJC Racing Club Limited', 'HKJC-OWN-001', 'approved'),
  ('op_hkjc_002', 'u_owner_hkjc_2', 'Peter Young Racing', 'HKJC-OWN-002', 'approved'),
  ('op_hkjc_003', 'u_owner_hkjc_3', 'Yan Family Racing', 'HKJC-OWN-003', 'approved'),
  ('op_hkjc_004', 'u_owner_hkjc_4', 'Cheng Partnership Racing', 'HKJC-OWN-004', 'approved');

INSERT INTO jockey_profiles (id, user_id, license_no, certificate_url, competition_level, height_cm, weight_kg, experience_years, bio, status) VALUES
  ('jp_001', 'u_jockey_1', 'JOC-A-1001', 'https://example.com/cert/marcus.pdf', 'Elite', 168, 54, 8, 'Experienced sprint jockey with strong turf performance.', 'published'),
  ('jp_002', 'u_jockey_2', 'JOC-B-2002', 'https://example.com/cert/diego.pdf', 'Qualifier', 171, 56, 5, 'Fast starter, good control in short races.', 'published'),
  ('jp_003', 'u_jockey_3', 'JOC-A-3003', 'https://example.com/cert/sarah.pdf', 'Elite', 165, 52, 7, 'Technical jockey with strong final sprint.', 'published'),
  ('jp_004', 'u_jockey_4', 'JOC-C-4004', 'https://example.com/cert/emily.pdf', 'Rookie', 166, 53, 2, 'Pending jockey profile awaiting admin approval.', 'pending'),
  ('jp_hkjc_001', 'u_jockey_hkjc_1', 'HKJC-JOC-LDE', 'https://racing.hkjc.com/en-us/local/information/jockeyprofile?JockeyId=LDE', 'Elite', 168, 54, 15, 'HKJC demo profile. Derek Leung Ka-chun is listed by HKJC with Group race achievements and Hong Kong career wins.', 'published'),
  ('jp_hkjc_002', 'u_jockey_hkjc_2', 'HKJC-JOC-CCY', 'https://racing.hkjc.com/en-us/local/information/jockeyprofile?JockeyId=CCY', 'Homegrown', 166, 52, 5, 'HKJC demo profile. Angus Chung Yik-lai is listed by HKJC as a Tony Cruz Award winner.', 'published'),
  ('jp_hkjc_003', 'u_jockey_hkjc_3', 'HKJC-JOC-ZPU', 'https://racing.hkjc.com/en-us/local/information/jockeys', 'Champion', 170, 55, 18, 'HKJC demo profile based on public jockey listing.', 'published');

INSERT INTO referee_profiles (id, user_id, license_no, level, years_experience, status) VALUES
  ('rp_001', 'u_referee_1', 'REF-A-9001', 'International', 12, 'active'),
  ('rp_002', 'u_referee_2', 'REF-B-9002', 'National', 6, 'active');

INSERT INTO spectator_profiles (id, user_id, reward_points, preferred_language) VALUES
  ('sp_001', 'u_spectator_1', 120, 'vi'),
  ('sp_002', 'u_spectator_2', 75, 'vi'),
  ('sp_003', 'u_spectator_3', 40, 'vi');

INSERT INTO user_documents (id, user_id, document_type, file_url, status) VALUES
  ('doc_001', 'u_owner_1', 'owner_license', 'https://example.com/doc/owner-1.pdf', 'approved'),
  ('doc_002', 'u_owner_2', 'owner_license', 'https://example.com/doc/owner-2.pdf', 'approved'),
  ('doc_003', 'u_owner_3', 'owner_license', 'https://example.com/doc/owner-3.pdf', 'pending'),
  ('doc_004', 'u_jockey_1', 'jockey_certificate', 'https://example.com/doc/jockey-1.pdf', 'approved'),
  ('doc_005', 'u_jockey_4', 'jockey_certificate', 'https://example.com/doc/jockey-4.pdf', 'pending'),
  ('doc_hkjc_001', 'u_owner_hkjc_1', 'owner_license', 'https://member.hkjc.com/member/english/horse-owner/index.aspx', 'approved'),
  ('doc_hkjc_002', 'u_owner_hkjc_2', 'owner_license', 'https://racingnews.hkjc.com/english/2025/09/04/change-of-owners-racing-names-from-1-august-31-august-2025/', 'approved'),
  ('doc_hkjc_003', 'u_owner_hkjc_3', 'owner_license', 'https://racingnews.hkjc.com/english/2025/09/04/change-of-owners-racing-names-from-1-august-31-august-2025/', 'approved'),
  ('doc_hkjc_004', 'u_jockey_hkjc_1', 'jockey_certificate', 'https://racing.hkjc.com/en-us/local/information/jockeyprofile?JockeyId=LDE', 'approved'),
  ('doc_hkjc_005', 'u_jockey_hkjc_2', 'jockey_certificate', 'https://racing.hkjc.com/en-us/local/information/jockeyprofile?JockeyId=CCY', 'approved');

-- ---------------------------------------------------------------------------
-- Tournament setup
-- ---------------------------------------------------------------------------
INSERT INTO tournaments (
  id, name, season, start_date, end_date, location, total_rounds, rules, prize_pool,
  registration_open_at, registration_close_at, status, created_by
) VALUES
  (
    't_001',
    'Summer Derby Classic',
    'Summer 2026',
    '2026-06-10',
    '2026-06-30',
    'Churchill Downs',
    3,
    'Ngua hop le phai du tuoi, du suc khoe, owner va jockey phai xac nhan truoc deadline. Prediction dong truoc gio dua 30 phut.',
    750000,
    '2026-05-20 08:00:00+07',
    '2026-05-31 23:59:00+07',
    'active',
    'u_admin'
  ),
  (
    't_002',
    'Autumn Night Cup',
    'Autumn 2026',
    '2026-09-05',
    '2026-09-20',
    'Phu Tho Racecourse',
    2,
    'Demo tournament dang o trang thai draft.',
    300000,
    NULL,
    NULL,
    'draft',
    'u_admin'
  );

INSERT INTO tournament_prize_rules (id, tournament_id, award_type, position_no, title, point_value, cash_amount, description) VALUES
  ('pr_001', 't_001', 'race_position', 1, 'Race Winner', 10, 50000, 'Hang 1 moi race'),
  ('pr_002', 't_001', 'race_position', 2, 'Race Runner Up', 7, 30000, 'Hang 2 moi race'),
  ('pr_003', 't_001', 'race_position', 3, 'Race Third Place', 5, 15000, 'Hang 3 moi race'),
  ('pr_004', 't_001', 'champion_horse', 1, 'Champion Horse', 30, 150000, 'Ngua vo dich toan giai'),
  ('pr_005', 't_001', 'best_jockey', 1, 'Best Jockey', 20, 80000, 'Jockey diem cao nhat'),
  ('pr_006', 't_001', 'prediction_reward', 1, 'Prediction Top 1 Correct', 50, 0, 'Du doan dung ngua ve nhat'),
  ('pr_007', 't_001', 'prediction_reward', 3, 'Prediction Top 3 Correct', 20, 0, 'Moi vi tri top 3 dung duoc cong diem');

INSERT INTO tournament_rounds (id, tournament_id, round_no, name, race_date, status) VALUES
  ('round_001', 't_001', 1, 'Qualifier Round', '2026-06-10', 'completed'),
  ('round_002', 't_001', 2, 'Semi Final', '2026-06-20', 'scheduled'),
  ('round_003', 't_001', 3, 'Final', '2026-06-30', 'scheduled');

-- ---------------------------------------------------------------------------
-- Horses and tournament registration
-- ---------------------------------------------------------------------------
INSERT INTO horses (
  id, owner_user_id, name, breed, age, sex, weight_kg, color, achievements, health_certificate_url, status
) VALUES
  ('h_001', 'u_owner_1', 'Midnight Storm', 'Thoroughbred', 4, 'male', 470, 'Black', 'Winner of Spring Derby 2025', 'https://example.com/health/midnight.pdf', 'approved'),
  ('h_002', 'u_owner_1', 'Racing Thunder', 'Quarter Horse', 3, 'male', 455, 'Chestnut', 'Top 3 Golden Sprint 2025', 'https://example.com/health/thunder.pdf', 'approved'),
  ('h_003', 'u_owner_2', 'Silver Arrow', 'Arabian', 5, 'female', 430, 'Gray', 'Regional champion 2024', 'https://example.com/health/arrow.pdf', 'approved'),
  ('h_004', 'u_owner_2', 'Blue Comet', 'Thoroughbred', 4, 'gelding', 462, 'Bay', 'Strong turf acceleration', 'https://example.com/health/comet.pdf', 'approved'),
  ('h_005', 'u_owner_3', 'Golden Spirit', 'Thoroughbred', 3, 'female', 440, 'Palomino', 'New competitor', 'https://example.com/health/spirit.pdf', 'pending'),
  ('h_006', 'u_owner_1', 'Desert Wind', 'Arabian', 6, 'male', 448, 'Brown', 'Long distance specialist', 'https://example.com/health/wind.pdf', 'rejected'),
  ('h_hkjc_001', 'u_owner_hkjc_1', 'YOUNG ACHIEVER', 'Thoroughbred', 4, 'gelding', 458, 'Bay', 'HKJC owner-search demo horse for HKJC Racing Club Limited.', 'https://racing.hkjc.com/en-us/local/information/ownersearch?HorseOwner=HKJC+Racing+Club+Limited', 'approved'),
  ('h_hkjc_002', 'u_owner_hkjc_1', 'YOUNG ARROW', 'Thoroughbred', 5, 'gelding', 466, 'Brown', 'HKJC owner-search demo horse for HKJC Racing Club Limited.', 'https://racing.hkjc.com/en-us/local/information/ownersearch?HorseOwner=HKJC+Racing+Club+Limited', 'approved'),
  ('h_hkjc_003', 'u_owner_hkjc_2', 'STAR BROSE', 'Thoroughbred', 4, 'gelding', 460, 'Chestnut', 'HKJC racing-news demo horse for Peter Young Wai Po.', 'https://racingnews.hkjc.com/english/2025/09/04/change-of-owners-racing-names-from-1-august-31-august-2025/', 'approved'),
  ('h_hkjc_004', 'u_owner_hkjc_4', 'LUCKY FIELD', 'Thoroughbred', 5, 'male', 472, 'Bay', 'HKJC racing-news demo horse for Cheng partnership owner.', 'https://racingnews.hkjc.com/english/2025/09/04/change-of-owners-racing-names-from-1-august-31-august-2025/', 'approved'),
  ('h_hkjc_005', 'u_owner_hkjc_3', 'FORTUNE GOLDSADDLE', 'Thoroughbred', 4, 'female', 438, 'Gray', 'HKJC racing-news demo horse for Mr & Mrs Yan Qing Lin.', 'https://racingnews.hkjc.com/english/2025/09/04/change-of-owners-racing-names-from-1-august-31-august-2025/', 'approved');

INSERT INTO horse_medical_records (id, horse_id, checked_by, check_date, weight_kg, health_status, note, document_url) VALUES
  ('hm_001', 'h_001', 'Dr. Carter', '2026-05-21', 470, 'fit', 'Passed health check.', 'https://example.com/medical/hm001.pdf'),
  ('hm_002', 'h_002', 'Dr. Carter', '2026-05-21', 455, 'fit', 'Passed health check.', 'https://example.com/medical/hm002.pdf'),
  ('hm_003', 'h_003', 'Dr. Nguyen', '2026-05-22', 430, 'fit', 'Excellent stamina.', 'https://example.com/medical/hm003.pdf'),
  ('hm_004', 'h_004', 'Dr. Nguyen', '2026-05-22', 462, 'monitoring', 'Minor ankle note, cleared with monitoring.', 'https://example.com/medical/hm004.pdf'),
  ('hm_005', 'h_005', 'Dr. Pham', '2026-05-25', 440, 'fit', 'Awaiting admin document review.', 'https://example.com/medical/hm005.pdf'),
  ('hm_006', 'h_006', 'Dr. Carter', '2026-05-26', 448, 'unfit', 'Not eligible this season.', 'https://example.com/medical/hm006.pdf'),
  ('hm_hkjc_001', 'h_hkjc_001', 'HKJC Veterinary Team', '2026-08-10', 458, 'fit', 'Demo health record from HKJC-inspired seed data.', 'https://example.com/medical/hkjc001.pdf'),
  ('hm_hkjc_002', 'h_hkjc_002', 'HKJC Veterinary Team', '2026-08-10', 466, 'fit', 'Demo health record from HKJC-inspired seed data.', 'https://example.com/medical/hkjc002.pdf'),
  ('hm_hkjc_003', 'h_hkjc_003', 'HKJC Veterinary Team', '2026-08-11', 460, 'fit', 'Demo health record from HKJC-inspired seed data.', 'https://example.com/medical/hkjc003.pdf'),
  ('hm_hkjc_004', 'h_hkjc_004', 'HKJC Veterinary Team', '2026-08-11', 472, 'monitoring', 'Monitor recovery before next race.', 'https://example.com/medical/hkjc004.pdf'),
  ('hm_hkjc_005', 'h_hkjc_005', 'HKJC Veterinary Team', '2026-08-12', 438, 'fit', 'Demo health record from HKJC-inspired seed data.', 'https://example.com/medical/hkjc005.pdf');

INSERT INTO tournament_registrations (
  id, tournament_id, horse_id, owner_user_id, status, note, registered_at, reviewed_by, reviewed_at
) VALUES
  ('tr_001', 't_001', 'h_001', 'u_owner_1', 'approved', 'Eligible horse.', '2026-05-22 09:00:00+07', 'u_admin', '2026-05-23 10:00:00+07'),
  ('tr_002', 't_001', 'h_002', 'u_owner_1', 'approved', 'Eligible horse.', '2026-05-22 09:30:00+07', 'u_admin', '2026-05-23 10:10:00+07'),
  ('tr_003', 't_001', 'h_003', 'u_owner_2', 'approved', 'Eligible horse.', '2026-05-23 13:00:00+07', 'u_admin', '2026-05-24 09:30:00+07'),
  ('tr_004', 't_001', 'h_004', 'u_owner_2', 'approved', 'Eligible with monitoring.', '2026-05-23 14:00:00+07', 'u_admin', '2026-05-24 10:30:00+07'),
  ('tr_005', 't_001', 'h_005', 'u_owner_3', 'pending', 'Waiting owner verification.', '2026-05-25 10:00:00+07', NULL, NULL),
  ('tr_006', 't_001', 'h_006', 'u_owner_1', 'rejected', 'Horse failed health condition.', '2026-05-26 10:00:00+07', 'u_admin', '2026-05-27 09:00:00+07');

INSERT INTO approval_logs (id, entity_type, entity_id, requested_by, reviewed_by, status, reason, created_at, reviewed_at) VALUES
  ('al_001', 'owner_profile', 'op_001', 'u_owner_1', 'u_admin', 'approved', 'Owner document valid.', '2026-05-20 08:10:00+07', '2026-05-20 10:00:00+07'),
  ('al_002', 'jockey_profile', 'jp_001', 'u_jockey_1', 'u_admin', 'approved', 'Certificate valid.', '2026-05-20 08:20:00+07', '2026-05-20 10:05:00+07'),
  ('al_003', 'horse_registration', 'tr_005', 'u_owner_3', NULL, 'pending', 'Waiting admin review.', '2026-05-25 10:00:00+07', NULL),
  ('al_004', 'jockey_profile', 'jp_004', 'u_jockey_4', NULL, 'pending', 'New jockey pending approval.', '2026-05-26 10:00:00+07', NULL),
  ('al_005', 'horse_registration', 'tr_006', 'u_owner_1', 'u_admin', 'rejected', 'Health check not passed.', '2026-05-26 10:00:00+07', '2026-05-27 09:00:00+07');

-- ---------------------------------------------------------------------------
-- Jockey invitations and assignments
-- ---------------------------------------------------------------------------
INSERT INTO jockey_invitations (
  id, tournament_id, horse_id, owner_user_id, jockey_user_id, message, status, created_at, responded_at
) VALUES
  ('ji_001', 't_001', 'h_001', 'u_owner_1', 'u_jockey_1', 'Please ride Midnight Storm in Summer Derby Classic.', 'accepted', '2026-05-24 09:00:00+07', '2026-05-24 11:00:00+07'),
  ('ji_002', 't_001', 'h_002', 'u_owner_1', 'u_jockey_2', 'Please ride Racing Thunder.', 'accepted', '2026-05-24 09:10:00+07', '2026-05-24 11:10:00+07'),
  ('ji_003', 't_001', 'h_003', 'u_owner_2', 'u_jockey_3', 'Please ride Silver Arrow.', 'accepted', '2026-05-24 09:20:00+07', '2026-05-24 11:20:00+07'),
  ('ji_004', 't_001', 'h_004', 'u_owner_2', 'u_jockey_1', 'Please ride Blue Comet in Semi Final.', 'accepted', '2026-05-24 09:30:00+07', '2026-05-24 11:30:00+07'),
  ('ji_005', 't_001', 'h_005', 'u_owner_3', 'u_jockey_2', 'Pending horse registration invitation.', 'pending', '2026-05-25 12:00:00+07', NULL);

INSERT INTO horse_jockey_assignments (id, tournament_id, horse_id, jockey_user_id, invitation_id, status, assigned_at) VALUES
  ('hja_001', 't_001', 'h_001', 'u_jockey_1', 'ji_001', 'active', '2026-05-24 11:05:00+07'),
  ('hja_002', 't_001', 'h_002', 'u_jockey_2', 'ji_002', 'active', '2026-05-24 11:15:00+07'),
  ('hja_003', 't_001', 'h_003', 'u_jockey_3', 'ji_003', 'active', '2026-05-24 11:25:00+07'),
  ('hja_004', 't_001', 'h_004', 'u_jockey_1', 'ji_004', 'active', '2026-05-24 11:35:00+07');

-- ---------------------------------------------------------------------------
-- Race schedule, entries, confirmations and referee assignments
-- ---------------------------------------------------------------------------
INSERT INTO races (
  id, tournament_id, round_id, race_number, name, race_date, start_time, venue,
  distance_m, surface_type, horse_limit, race_class,
  owner_confirm_deadline, jockey_confirm_deadline, prediction_open_at, prediction_close_at,
  status, created_by
) VALUES
  ('r_001', 't_001', 'round_001', 1, 'Summer Derby Qualifier R1', '2026-06-10', '16:30', 'Churchill Downs', 1400, 'turf', 6, 'Qualifier', '2026-06-08 18:00:00+07', '2026-06-08 20:00:00+07', '2026-06-09 08:00:00+07', '2026-06-10 16:00:00+07', 'published', 'u_admin'),
  ('r_002', 't_001', 'round_002', 2, 'Summer Derby Semi Final', '2026-06-20', '17:00', 'Churchill Downs', 1600, 'dirt', 6, 'Semi Final', '2026-06-18 18:00:00+07', '2026-06-18 20:00:00+07', '2026-06-19 08:00:00+07', '2026-06-20 16:30:00+07', 'awaiting_confirmations', 'u_admin'),
  ('r_003', 't_001', 'round_003', 3, 'Summer Derby Final', '2026-06-30', '18:30', 'Churchill Downs', 2000, 'turf', 8, 'Final', '2026-06-28 18:00:00+07', '2026-06-28 20:00:00+07', '2026-06-29 08:00:00+07', '2026-06-30 18:00:00+07', 'scheduled', 'u_admin');

INSERT INTO race_entries (
  id, race_id, tournament_registration_id, horse_id, jockey_user_id, lane_no,
  owner_confirm_status, jockey_confirm_status, owner_confirmed_at, jockey_confirmed_at,
  pre_check_status, entry_status, finish_position, finish_time_seconds, points, prize_amount
) VALUES
  ('re_001', 'r_001', 'tr_001', 'h_001', 'u_jockey_1', 1, 'confirmed', 'confirmed', '2026-06-07 09:00:00+07', '2026-06-07 10:00:00+07', 'qualified', 'finished', 2, 83.420, 7, 30000),
  ('re_002', 'r_001', 'tr_002', 'h_002', 'u_jockey_2', 2, 'confirmed', 'confirmed', '2026-06-07 09:10:00+07', '2026-06-07 10:05:00+07', 'qualified', 'finished', 3, 84.100, 5, 15000),
  ('re_003', 'r_001', 'tr_003', 'h_003', 'u_jockey_3', 3, 'confirmed', 'confirmed', '2026-06-07 09:20:00+07', '2026-06-07 10:10:00+07', 'qualified', 'finished', 1, 82.980, 10, 50000),
  ('re_004', 'r_002', 'tr_001', 'h_001', 'u_jockey_1', 1, 'confirmed', 'pending', '2026-06-17 09:00:00+07', NULL, 'pending', 'approved', NULL, NULL, 0, 0),
  ('re_005', 'r_002', 'tr_004', 'h_004', 'u_jockey_1', 2, 'pending', 'pending', NULL, NULL, 'pending', 'approved', NULL, NULL, 0, 0),
  ('re_006', 'r_002', 'tr_002', 'h_002', 'u_jockey_2', 3, 'pending', 'pending', NULL, NULL, 'pending', 'approved', NULL, NULL, 0, 0);

INSERT INTO referee_assignments (id, race_id, referee_user_id, role_in_race, assigned_by, assigned_at) VALUES
  ('ra_001', 'r_001', 'u_referee_1', 'main_referee', 'u_admin', '2026-06-01 09:00:00+07'),
  ('ra_002', 'r_001', 'u_referee_2', 'assistant_referee', 'u_admin', '2026-06-01 09:05:00+07'),
  ('ra_003', 'r_002', 'u_referee_1', 'main_referee', 'u_admin', '2026-06-11 09:00:00+07'),
  ('ra_004', 'r_003', 'u_referee_2', 'main_referee', 'u_admin', '2026-06-21 09:00:00+07');

INSERT INTO pre_race_checks (
  id, race_entry_id, referee_user_id, horse_health, horse_weight_ok, equipment_ok,
  jockey_license_ok, uniform_ok, decision, note, checked_at
) VALUES
  ('pc_001', 're_001', 'u_referee_1', 'pass', TRUE, TRUE, TRUE, TRUE, 'qualified', 'All clear.', '2026-06-10 15:20:00+07'),
  ('pc_002', 're_002', 'u_referee_1', 'pass', TRUE, TRUE, TRUE, TRUE, 'qualified', 'All clear.', '2026-06-10 15:25:00+07'),
  ('pc_003', 're_003', 'u_referee_1', 'pass', TRUE, TRUE, TRUE, TRUE, 'qualified', 'All clear.', '2026-06-10 15:30:00+07');

INSERT INTO live_race_events (id, race_id, race_entry_id, event_type, event_second, current_position, description, recorded_by, recorded_at) VALUES
  ('ev_001', 'r_001', NULL, 'race_started', 0.000, NULL, 'Race started.', 'u_referee_1', '2026-06-10 16:30:00+07'),
  ('ev_002', 'r_001', 're_001', 'position_update', 30.000, 1, 'Midnight Storm leads early.', 'u_referee_2', '2026-06-10 16:30:30+07'),
  ('ev_003', 'r_001', 're_003', 'position_update', 70.000, 1, 'Silver Arrow overtakes near final turn.', 'u_referee_2', '2026-06-10 16:31:10+07'),
  ('ev_004', 'r_001', NULL, 'race_finished', 84.500, NULL, 'Race finished.', 'u_referee_1', '2026-06-10 16:31:25+07');

INSERT INTO violations (id, race_id, race_entry_id, referee_user_id, violation_type, severity, penalty, description, status, created_at) VALUES
  ('vio_001', 'r_001', 're_002', 'u_referee_1', 'blocking', 'minor', 'Warning', 'Racing Thunder moved inward near lane boundary.', 'resolved', '2026-06-10 16:31:00+07');

-- ---------------------------------------------------------------------------
-- Results, bets, rewards, ranking and prizes
-- ---------------------------------------------------------------------------
INSERT INTO race_results (
  id, race_id, status, confirmed_by, confirmed_at, published_by, published_at, official_note
) VALUES
  ('rr_001', 'r_001', 'admin_published', 'u_referee_1', '2026-06-10 17:00:00+07', 'u_admin', '2026-06-10 18:00:00+07', 'Official result published after referee confirmation.');

INSERT INTO race_result_details (
  id, race_result_id, race_entry_id, finish_position, finish_time_seconds, points_awarded, prize_amount, note
) VALUES
  ('rrd_001', 'rr_001', 're_003', 1, 82.980, 10, 50000, 'Winner'),
  ('rrd_002', 'rr_001', 're_001', 2, 83.420, 7, 30000, 'Runner up'),
  ('rrd_003', 'rr_001', 're_002', 3, 84.100, 5, 15000, 'Third place');

INSERT INTO bets (id, spectator_user_id, race_id, bet_type, stake_points, status, submitted_at, locked_at) VALUES
  ('bet_001', 'u_spectator_1', 'r_001', 'top3_prediction', 10, 'won', '2026-06-09 09:00:00+07', '2026-06-10 16:00:00+07'),
  ('bet_002', 'u_spectator_2', 'r_001', 'top3_prediction', 10, 'won', '2026-06-09 09:15:00+07', '2026-06-10 16:00:00+07'),
  ('bet_003', 'u_spectator_3', 'r_001', 'winner_prediction', 5, 'lost', '2026-06-09 10:00:00+07', '2026-06-10 16:00:00+07');

INSERT INTO bet_selections (id, bet_id, predicted_position, horse_id) VALUES
  ('bs_001', 'bet_001', 1, 'h_003'),
  ('bs_002', 'bet_001', 2, 'h_001'),
  ('bs_003', 'bet_001', 3, 'h_002'),
  ('bs_004', 'bet_002', 1, 'h_001'),
  ('bs_005', 'bet_002', 2, 'h_003'),
  ('bs_006', 'bet_002', 3, 'h_002'),
  ('bs_007', 'bet_003', 1, 'h_002');

INSERT INTO prediction_rewards (
  id, bet_id, race_result_id, correct_winner, correct_top3_count, reward_points, reward_amount, calculated_at, paid_at
) VALUES
  ('prew_001', 'bet_001', 'rr_001', TRUE, 3, 110, 0, '2026-06-10 18:10:00+07', '2026-06-10 18:30:00+07'),
  ('prew_002', 'bet_002', 'rr_001', FALSE, 1, 20, 0, '2026-06-10 18:10:00+07', '2026-06-10 18:30:00+07'),
  ('prew_003', 'bet_003', 'rr_001', FALSE, 0, 0, 0, '2026-06-10 18:10:00+07', NULL);

INSERT INTO ranking_snapshots (
  id, tournament_id, ranking_type, entity_id, rank_no, total_points, total_races, total_wins, prize_amount, snapshot_at
) VALUES
  ('rank_h_001', 't_001', 'horse', 'h_003', 1, 10, 1, 1, 50000, '2026-06-10 18:15:00+07'),
  ('rank_h_002', 't_001', 'horse', 'h_001', 2, 7, 1, 0, 30000, '2026-06-10 18:15:00+07'),
  ('rank_h_003', 't_001', 'horse', 'h_002', 3, 5, 1, 0, 15000, '2026-06-10 18:15:00+07'),
  ('rank_j_001', 't_001', 'jockey', 'u_jockey_3', 1, 10, 1, 1, 50000, '2026-06-10 18:15:00+07'),
  ('rank_j_002', 't_001', 'jockey', 'u_jockey_1', 2, 7, 1, 0, 30000, '2026-06-10 18:15:00+07'),
  ('rank_o_001', 't_001', 'owner', 'u_owner_2', 1, 10, 1, 1, 50000, '2026-06-10 18:15:00+07');

INSERT INTO prize_distributions (
  id, tournament_id, recipient_user_id, horse_id, prize_type, title, amount, status, paid_at
) VALUES
  ('pd_001', 't_001', 'u_owner_2', 'h_003', 'race_prize', 'Race 01 Winner Prize', 50000, 'paid', '2026-06-11 09:00:00+07'),
  ('pd_002', 't_001', 'u_owner_1', 'h_001', 'race_prize', 'Race 01 Runner Up Prize', 30000, 'paid', '2026-06-11 09:10:00+07'),
  ('pd_003', 't_001', 'u_owner_1', 'h_002', 'race_prize', 'Race 01 Third Place Prize', 15000, 'pending', NULL),
  ('pd_004', 't_001', 'u_spectator_1', NULL, 'prediction_reward', 'Prediction Reward Points', 0, 'approved', NULL);

INSERT INTO awards (id, tournament_id, award_name, award_type, recipient_user_id, horse_id, description, announced_at) VALUES
  ('aw_001', 't_001', 'Race 01 Best Performance', 'champion_horse', 'u_owner_2', 'h_003', 'Silver Arrow won Qualifier R1.', '2026-06-10 18:30:00+07'),
  ('aw_002', 't_001', 'Prediction Leader', 'prediction_winner', 'u_spectator_1', NULL, 'Perfect Top 3 prediction for Race 01.', '2026-06-10 18:30:00+07');

-- ---------------------------------------------------------------------------
-- Reports, notifications, sessions and audit logs
-- ---------------------------------------------------------------------------
INSERT INTO reports (id, tournament_id, race_id, report_type, title, content, created_by, created_at) VALUES
  ('rep_001', 't_001', 'r_001', 'referee_report', 'Referee Report - Race 01', 'Race completed. One minor blocking violation was warned. Result confirmed.', 'u_referee_1', '2026-06-10 17:10:00+07'),
  ('rep_002', 't_001', NULL, 'tournament_summary', 'Summer Derby Current Summary', 'Tournament has completed qualifier race and is waiting for semi-final confirmations.', 'u_admin', '2026-06-11 09:30:00+07'),
  ('rep_003', 't_001', 'r_001', 'violation_summary', 'Violation Summary - Race 01', 'Racing Thunder received warning for lane blocking.', 'u_referee_1', '2026-06-10 17:15:00+07');

INSERT INTO notifications (id, user_id, title, message, is_read, created_at) VALUES
  ('noti_001', 'u_owner_1', 'Horse approved', 'Midnight Storm has been approved by Admin.', TRUE, '2026-05-23 10:00:00+07'),
  ('noti_002', 'u_jockey_1', 'New riding request', 'Sterling Stables invited you to ride Midnight Storm.', TRUE, '2026-05-24 09:00:00+07'),
  ('noti_003', 'u_admin', 'Pending approval', 'Golden Spirit registration is waiting for review.', FALSE, '2026-05-25 10:00:00+07'),
  ('noti_004', 'u_spectator_1', 'Prediction reward', 'You earned 110 points from Race 01 prediction.', FALSE, '2026-06-10 18:15:00+07'),
  ('noti_005', 'u_owner_2', 'Race result published', 'Silver Arrow won Summer Derby Qualifier R1.', FALSE, '2026-06-10 18:00:00+07'),
  ('noti_006', 'u_referee_1', 'Race assigned', 'You are assigned as main referee for Semi Final.', FALSE, '2026-06-11 09:00:00+07');

INSERT INTO sessions (token, user_id, created_at, expires_at) VALUES
  ('seed_admin_token', 'u_admin', '2026-05-29 09:00:00+07', '2026-06-01 09:00:00+07'),
  ('seed_owner_token', 'u_owner_1', '2026-05-29 09:05:00+07', '2026-06-01 09:05:00+07'),
  ('seed_jockey_token', 'u_jockey_1', '2026-05-29 09:10:00+07', '2026-06-01 09:10:00+07');

INSERT INTO audit_logs (id, actor_id, action, entity_type, entity_id, old_value, new_value, created_at) VALUES
  ('audit_001', 'u_admin', 'CREATE_TOURNAMENT', 'tournament', 't_001', NULL, '{"status":"draft","name":"Summer Derby Classic"}', '2026-05-20 08:00:00+07'),
  ('audit_002', 'u_admin', 'OPEN_REGISTRATION', 'tournament', 't_001', '{"status":"draft"}', '{"status":"open_registration"}', '2026-05-20 08:05:00+07'),
  ('audit_003', 'u_admin', 'APPROVE_HORSE', 'tournament_registration', 'tr_001', '{"status":"pending"}', '{"status":"approved"}', '2026-05-23 10:00:00+07'),
  ('audit_004', 'u_referee_1', 'CONFIRM_RESULT', 'race_result', 'rr_001', '{"status":"draft"}', '{"status":"referee_confirmed"}', '2026-06-10 17:00:00+07'),
  ('audit_005', 'u_admin', 'PUBLISH_RESULT', 'race_result', 'rr_001', '{"status":"referee_confirmed"}', '{"status":"admin_published"}', '2026-06-10 18:00:00+07');

COMMIT;
