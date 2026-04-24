# 운영 지표 분석 (SLA / 처리시간 / 해결율)

keywords: SLA, 처리시간, 처리시간, 해결율, 응답시간, 리드타임, 병목, bottleneck, resolution, response time, lead time, throughput, backlog, 대기, 큐, queue, 운영, operational

## Benchmarks

| metric | value | context | source |
|--------|-------|---------|--------|
| SLA 준수율 (상위) | 90-95% | SaaS CS | Zendesk Benchmark Report 2024 |
| SLA 준수율 (평균) | 80-85% | SaaS CS | Zendesk Benchmark Report 2024 |
| 평균 첫 응답시간 | 1-4시간 | SaaS CS | Freshdesk Benchmark 2024 |
| 평균 처리시간 | 12-24시간 | SaaS CS | Zendesk Benchmark Report 2024 |
| 에스컬레이션율 (적정) | 10-20% | CS | TSIA 2024 |
| 재접수율 (적정) | 5-10% | CS | Zendesk Benchmark Report 2024 |
| 셀프서비스 해결율 (목표) | 30-50% | SaaS | Gartner 2024 |

### 채널별 응답시간 SLA 벤치마크

| channel | 첫 응답 목표 | 해결 목표 | 이탈 신호 |
|---------|------------|----------|----------|
| 채팅 | 2분 | 15분 | 첫 응답 2분 초과 시 인력 부족 |
| 이메일 | 4시간 | 24시간 | 해결 24h 초과 비율이 채널 SLA 위반의 주 원인인지 확인 |
| 전화 | 즉시 | 10분 | 후속 티켓 전환 비율 높으면 역량 문제 |
| 소셜 | 1시간 | 4시간 | 응답 지연은 브랜드 리스크 직결 |

## Terminology

| term | definition |
|------|-----------|
| SLA (Service Level Agreement) | 서비스 수준 계약. 유형/우선순위별 첫 응답·해결 목표 시간 정의 |
| MTTR (Mean Time to Resolution) | 평균 처리시간. 접수~종료까지 소요 시간 |
| FRT (First Response Time) | 첫 응답시간. 접수~첫 응답까지 소요 시간 |
| Backlog | 미해결 잔여 건수. 증가 추세면 인력 부족 신호 |
| Throughput | 처리량. 단위 시간당 처리 완료 건수 |
| Queue Time | 큐 대기시간. 접수 후 담당자가 확인하기까지의 공백 |
| Escalation | 1차 담당자가 해결 불가 시 상위 팀으로 이관 |
| Reopen Rate | 재오픈율. 해결 후 고객이 다시 문의. 높으면 해결 품질 문제 |

## Severity Classification

| severity | definition | 적정 응답 | 팔로업 주기 |
|----------|-----------|----------|------------|
| Critical | 프로덕션 다운, 데이터 위험, 다수 고가치 고객 영향 | 즉시 | 내부 2h / 고객 2-4h |
| High | 주요 기능 장애, 핵심 고객 차단, SLA 위험 | 당일 | 내부 4h / 고객 4-8h |
| Medium | 워크어라운드 있는 이슈, 긴급하지 않은 비즈니스 영향 | 금주 내 | 내부 일 1회 / 고객 1-2영업일 |

## 처리시간 분해 프레임워크

느린 항목의 처리시간을 분해하는 표준 구조:

```
전체 처리시간 = 큐 대기 + 배정 대기 + 실제 처리 + 고객 응답 대기
```

- StackedBarChart로 항목별 내부 구성 분해
- "배정 대기"가 전체의 40%+ 이면 수동 배정 구조 문제
- "고객 응답 대기"가 크면 → 고객 측 지연이므로 SLA 계산에서 제외 검토

## Business Impact Dimensions

| dimension | 분석 시 질문 |
|-----------|-------------|
| Breadth | 몇 명의 고객/유저가 영향받는가? 증가 추세인가? |
| Depth | 완전 차단 vs 불편? 핵심 워크플로 영향? |
| Duration | 얼마나 지속? 임계점까지 남은 시간? |
| Revenue | 위험에 처한 ARR? 진행 중인 딜 영향? |
| Reputation | 외부 공개 가능성? 레퍼런스 고객? |
| Contractual | SLA 위반? 계약상 의무? |

## Common Decisions

| decision | required_info |
|----------|--------------|
| SLA 기준 재정의 | 카테고리별 처리시간 분포, 우선순위별 위반율, 고객 기대 대비 실제 |
| 인력 충원 vs 자동화 | 1인당 처리량, 셀프서비스 해결율, 반복 문의 비율, 자동화 가능 비중 |
| 에스컬레이션 프로세스 개선 | 에스컬레이션율, 단계별 소요시간, 에스컬레이션 후 처리시간, 불필요 에스컬레이션 비중 |
| 채널 전략 | 채널별 CSAT, 처리시간, 비용, 선호도 |
