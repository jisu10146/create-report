# Customer Support Analytics

keywords: 고객 문의, 티켓, CS, 지원, support, ticket, zendesk, freshdesk, intercom, helpdesk, SLA, CSAT, 응답시간, 해결시간, 에스컬레이션, 만족도, NPS, CES, 이탈, 문의 유형, 카테고리

## Benchmarks

| metric | value | source |
|--------|-------|--------|
| SLA 준수율 (SaaS 상위) | 90-95% | Zendesk Benchmark Report 2024 |
| SLA 준수율 (SaaS 평균) | 80-85% | Zendesk Benchmark Report 2024 |
| 평균 첫 응답시간 (SaaS) | 1-4시간 | Freshdesk Customer Service Benchmark 2024 |
| 평균 해결시간 (SaaS) | 12-24시간 | Zendesk Benchmark Report 2024 |
| CSAT (SaaS 상위) | 4.3-4.7 / 5.0 | ACSI (American Customer Satisfaction Index) 2024 |
| CSAT (SaaS 평균) | 4.0-4.2 / 5.0 | ACSI 2024 |
| 1차 해결율 (FCR, 상위) | 75-85% | MetricNet FCR Benchmark 2024 |
| 1차 해결율 (FCR, 평균) | 65-72% | MetricNet FCR Benchmark 2024 |
| 에이전트 1인당 일 처리량 | 15-25건 | HDI (Help Desk Institute) Support Center Benchmark 2024 |
| 셀프서비스 해결율 (목표) | 30-50% | Gartner Customer Service Technology Report 2024 |
| 에스컬레이션율 (적정) | 10-20% | TSIA (Technology & Services Industry Association) 2024 |
| 재접수율 (적정) | 5-10% | Zendesk Benchmark Report 2024 |
| NPS (SaaS 양호) | 30-50 | Retently NPS Benchmark 2024 |
| CES (Customer Effort Score, 양호) | 5.0 이하 / 7.0 | Gartner CES Benchmark 2024 |

## Terminology

| term | definition |
|------|-----------|
| SLA (Service Level Agreement) | 서비스 수준 계약. 티켓 유형/우선순위별 첫 응답·해결 목표 시간을 정의 |
| CSAT (Customer Satisfaction Score) | 고객 만족도. 보통 1-5점 또는 1-10점 척도. 해결 직후 설문으로 수집 |
| FCR (First Contact Resolution) | 1차 해결율. 에스컬레이션 없이 첫 번째 상담에서 해결된 비율. 높을수록 효율적 |
| MTTR (Mean Time to Resolution) | 평균 해결시간. 티켓 생성~종료까지 걸린 시간. 업무시간 기준과 캘린더 기준 구분 필요 |
| FRT (First Response Time) | 첫 응답시간. 티켓 생성~첫 에이전트 응답까지 걸린 시간 |
| Escalation | 에스컬레이션. 1차 상담원이 해결 불가 시 상위 담당자/팀으로 이관하는 프로세스 |
| Backlog | 미해결 잔여 티켓. 일정 시점의 미처리 티켓 수. 증가 추세면 인력 부족 신호 |
| Ticket Deflection | 셀프서비스(FAQ, 봇)로 티켓 접수 없이 해결된 비율 |
| Reopen Rate | 재오픈율. 해결 처리 후 고객이 다시 문의를 재개한 비율. 높으면 해결 품질 문제 |
| NPS (Net Promoter Score) | 순추천지수. 추천 의향 0-10점 중 추천자(9-10) 비율 - 비추천자(0-6) 비율 |
| CES (Customer Effort Score) | 고객 노력 점수. 문제 해결까지 고객이 들인 노력. 1(매우 쉬움)-7(매우 어려움) |
| Ticket Volume Trend | 티켓 유입량 추이. 주별/월별 패턴으로 인력 배치와 시즌 대비에 활용 |

## Common Decisions

| decision | required_info |
|----------|--------------|
| 인력 충원 vs 자동화 투자 | 에이전트 1인당 처리량, 셀프서비스 해결율, 반복 문의 비율, 자동화 가능 카테고리 비중 |
| SLA 기준 재정의 | 카테고리별 현재 해결시간 분포, 우선순위별 위반율, 고객 기대치 대비 실제 성과 |
| 에스컬레이션 프로세스 개선 | 에스컬레이션율, 에스컬레이션 단계별 소요시간, 에스컬레이션 후 해결시간 |
| 셀프서비스 확대 범위 | 카테고리별 1차 해결율, 반복 문의 사유 Top 10, FAQ 커버리지 대비 문의 유형 |
| 에이전트 교육/코칭 우선순위 | 에이전트별 CSAT, 1차 해결율, 해결시간 편차, 카테고리별 처리 난이도 |
| 채널 전략 (전화/채팅/이메일 비중) | 채널별 CSAT, 해결시간, 비용, 고객 선호도, 카테고리별 적합 채널 |
