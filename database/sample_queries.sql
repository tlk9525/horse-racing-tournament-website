-- Horse Racing Tournament Management System - sample reporting queries
-- Dung khi bao ve/de thi SQL: chay sau schema.sql va seed.sql

-- 1. Xem trang thai tong the cua tung giai dau
SELECT *
FROM v_tournament_flow_status
ORDER BY tournament_name;

-- 2. Danh sach ngua da duoc duyet trong mot giai
SELECT
  t.name AS tournament_name,
  h.name AS horse_name,
  owner.full_name AS owner_name,
  tr.status,
  tr.reviewed_at
FROM tournament_registrations tr
JOIN tournaments t ON t.id = tr.tournament_id
JOIN horses h ON h.id = tr.horse_id
JOIN users owner ON owner.id = tr.owner_user_id
WHERE t.id = 't_001'
  AND tr.status = 'approved'
ORDER BY h.name;

-- 3. Danh sach jockey da ghep voi ngua trong giai
SELECT
  t.name AS tournament_name,
  h.name AS horse_name,
  jockey.full_name AS jockey_name,
  hja.status,
  hja.assigned_at
FROM horse_jockey_assignments hja
JOIN tournaments t ON t.id = hja.tournament_id
JOIN horses h ON h.id = hja.horse_id
JOIN users jockey ON jockey.id = hja.jockey_user_id
WHERE hja.tournament_id = 't_001'
ORDER BY h.name;

-- 4. Lich race kem trong tai duoc phan cong
SELECT
  r.name AS race_name,
  r.race_date,
  r.start_time,
  r.venue,
  r.status,
  referee.full_name AS referee_name,
  ra.role_in_race
FROM races r
LEFT JOIN referee_assignments ra ON ra.race_id = r.id
LEFT JOIN users referee ON referee.id = ra.referee_user_id
WHERE r.tournament_id = 't_001'
ORDER BY r.race_date, r.start_time, ra.role_in_race;

-- 5. Roster cua race: lane, horse, owner, jockey, trang thai xac nhan
SELECT *
FROM v_race_entry_roster
WHERE race_id = 'r_001'
ORDER BY lane_no;

-- 6. Cac ho so/registration dang cho admin duyet
SELECT
  entity_type,
  entity_id,
  status,
  reason,
  created_at
FROM approval_logs
WHERE status = 'pending'
ORDER BY created_at;

-- 7. Kiem tra truoc dua: ngua nao qualified/disqualified
SELECT
  r.name AS race_name,
  h.name AS horse_name,
  jockey.full_name AS jockey_name,
  pc.decision,
  pc.note,
  pc.checked_at
FROM pre_race_checks pc
JOIN race_entries re ON re.id = pc.race_entry_id
JOIN races r ON r.id = re.race_id
JOIN horses h ON h.id = re.horse_id
JOIN users jockey ON jockey.id = re.jockey_user_id
ORDER BY pc.checked_at;

-- 8. Bien ban vi pham theo race
SELECT
  r.name AS race_name,
  h.name AS horse_name,
  v.violation_type,
  v.severity,
  v.penalty,
  v.description,
  v.status
FROM violations v
JOIN races r ON r.id = v.race_id
LEFT JOIN race_entries re ON re.id = v.race_entry_id
LEFT JOIN horses h ON h.id = re.horse_id
ORDER BY v.created_at;

-- 9. Ket qua chinh thuc cua race
SELECT
  r.name AS race_name,
  rrd.finish_position,
  h.name AS horse_name,
  jockey.full_name AS jockey_name,
  rrd.finish_time_seconds,
  rrd.points_awarded,
  rrd.prize_amount
FROM race_result_details rrd
JOIN race_results rr ON rr.id = rrd.race_result_id
JOIN races r ON r.id = rr.race_id
JOIN race_entries re ON re.id = rrd.race_entry_id
JOIN horses h ON h.id = re.horse_id
JOIN users jockey ON jockey.id = re.jockey_user_id
WHERE rr.status = 'admin_published'
ORDER BY r.name, rrd.finish_position;

-- 10. Bang xep hang ngua tinh tu ket qua da publish
SELECT *
FROM v_horse_ranking
WHERE tournament_id = 't_001'
ORDER BY total_points DESC, total_wins DESC, total_prize DESC;

-- 11. Bang thuong du doan cua khan gia
SELECT *
FROM v_prediction_scoreboard
ORDER BY reward_points DESC, reward_amount DESC;

-- 12. Chi tiet du doan top 3 cua tung khan gia
SELECT
  spectator.full_name AS spectator_name,
  r.name AS race_name,
  bs.predicted_position,
  h.name AS predicted_horse,
  b.status
FROM bet_selections bs
JOIN bets b ON b.id = bs.bet_id
JOIN users spectator ON spectator.id = b.spectator_user_id
JOIN races r ON r.id = b.race_id
JOIN horses h ON h.id = bs.horse_id
ORDER BY spectator.full_name, r.name, bs.predicted_position;

-- 13. Tong tien thuong da/phai tra theo owner
SELECT
  recipient.full_name AS recipient_name,
  COUNT(pd.id) AS prize_count,
  SUM(pd.amount) AS total_amount,
  SUM(CASE WHEN pd.status = 'paid' THEN pd.amount ELSE 0 END) AS paid_amount,
  SUM(CASE WHEN pd.status <> 'paid' THEN pd.amount ELSE 0 END) AS unpaid_amount
FROM prize_distributions pd
LEFT JOIN users recipient ON recipient.id = pd.recipient_user_id
WHERE pd.tournament_id = 't_001'
GROUP BY recipient.full_name
ORDER BY total_amount DESC;

-- 14. Bao cao trong tai va bao cao tong ket
SELECT
  report_type,
  title,
  created_by_user.full_name AS created_by,
  created_at
FROM reports rp
LEFT JOIN users created_by_user ON created_by_user.id = rp.created_by
WHERE rp.tournament_id = 't_001'
ORDER BY created_at DESC;

-- 15. Audit log cho flow nghiep vu
SELECT
  actor.full_name AS actor_name,
  al.action,
  al.entity_type,
  al.entity_id,
  al.created_at
FROM audit_logs al
LEFT JOIN users actor ON actor.id = al.actor_id
ORDER BY al.created_at;
