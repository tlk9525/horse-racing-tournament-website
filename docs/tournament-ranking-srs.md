# Software Requirement Specification: Tournament Ranking

## 1. Purpose

This document defines the tournament scoring and ranking requirements for the Horse Racing Tournament Management System.

## 2. Scope

The system shall support tournament-level race results, cumulative scoring, final rankings, and read-only access for completed tournaments.

## 3. Actors

- Admin: manages tournaments, races, approvals, official results, rankings, and awards.
- Owner: views tournament details, race cards, owned horse performance, and rankings.
- Jockey: views assigned races, horse assignments, race cards, history, and rankings.
- Referee: views assigned races, checks participants, starts races, records results, and submits outcomes.
- Spectator: views public tournaments, races, results, rankings, and awards.

## 4. Functional Requirements

| ID | Requirement |
| --- | --- |
| FR-TR-01 | Each tournament shall contain exactly 10 horses. |
| FR-TR-02 | Each tournament shall contain exactly 10 races. |
| FR-TR-03 | All 10 horses shall participate in all 10 races of the tournament. |
| FR-TR-04 | Each horse shall have exactly one jockey assignment per race. |
| FR-RS-01 | The system shall store each horse's position after every race. |
| FR-RS-02 | The system shall store each horse's finish time after every race. |
| FR-RK-01 | The system shall calculate tournament rankings from official race results only. |
| FR-RK-02 | The system shall allow users to select a tournament and view rankings for that tournament. |
| FR-LOCK-01 | When a tournament is completed, all roles shall only be able to view tournament details and race details. |

## 5. Scoring Rules

| Position | Score |
| --- | ---: |
| 1 | 10 |
| 2 | 7 |
| 3 | 5 |
| 4 | 3 |
| 5 | 2 |
| 6 | 1 |
| 7-10 | 0 |

## 6. Ranking Rules

Rankings shall be sorted by:

1. Total Score descending.
2. Number of 1st-place finishes descending.
3. Number of 2nd-place finishes descending.
4. Total finish time ascending.

The champion of the tournament shall be the horse ranked first after Race 10.

## 7. Acceptance Criteria

- AC-01: A completed tournament displays 10 races and 10 horses.
- AC-02: A completed tournament exposes View Details and View Race only.
- AC-03: Ranking selector lists available tournaments.
- AC-04: Ranking table recalculates when a different tournament is selected.
- AC-05: Ranking table shows total score, race count, first-place count, second-place count, and total finish time.
- AC-06: Tie-break behavior follows the ranking rules defined in section 6.
