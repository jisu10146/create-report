# Marketing Attribution

keywords: attribution, 귀인, 기여, 기여도, 채널, roas, cpa, touchpoint, 터치포인트, 멀티터치, multi-touch, 캠페인 성과, 예산 배분, 광고비

## Benchmarks

| metric | value | source |
|--------|-------|--------|
| 평균 전환 터치포인트 수 (B2B SaaS) | 3.5-5.2회 | Dreamdata B2B Attribution Report 2024 |
| 평균 전환 터치포인트 수 (B2C) | 2.3-3.8회 | Google Analytics Industry Benchmarks 2024 |
| Last-touch vs Multi-touch 기여도 차이 | 15-40% | Nielsen Marketing Attribution Report 2024 |
| Position-based 추천 가중치 | First 40%, Last 40%, Mid 20% | Google Analytics 기본값 |
| Time-decay 반감기 (권장) | 7일 | Meta/Google 광고 플랫폼 표준 |
| Paid Search ROAS (B2B 평균) | 2-5x | WordStream Benchmark Report 2024 |
| Paid Social ROAS (B2B 평균) | 1.5-3x | Metadata.io B2B Benchmark 2024 |
| Email Marketing ROI | 36:1 | Litmus Email ROI Report 2024 |
| 어시스트 채널 과소평가율 (Last-touch 기준) | 20-35% | Bizible/Marketo Attribution Study |
| 최적 채널 믹스 수 (B2B) | 4-6개 | Forrester Channel Mix Report 2024 |

## Terminology

| term | definition |
|------|-----------|
| First-touch Attribution | 첫 번째 접점에 전환 기여도 100%를 부여하는 모델. 인지(Awareness) 채널을 높이 평가 |
| Last-touch Attribution | 마지막 접점에 전환 기여도 100%를 부여하는 모델. 전환(Conversion) 채널을 높이 평가 |
| Linear Attribution | 모든 접점에 동일한 기여도를 부여하는 모델. 편향 없지만 채널 간 차이를 희석 |
| Position-based (U-shaped) | 첫 접점 40% + 마지막 접점 40% + 중간 접점 나머지 20% 균등 배분. 가장 실무적으로 권장되는 모델 |
| Time-decay Attribution | 전환 시점에 가까운 접점일수록 높은 가중치를 부여. 반감기(보통 7일) 기준으로 기여도 감소 |
| ROAS | 광고비 대비 매출 (Return on Ad Spend). 1x 이상이면 광고비 회수, 3x 이상이면 양호 |
| CPA | 전환당 비용 (Cost per Acquisition). 낮을수록 효율적 |
| Assist Rate | 직접 전환은 아니지만 전환 경로에 포함된 비율. 어시스트 채널의 간접 기여도 측정 |
| 전환 경로 (Conversion Path) | 사용자가 전환까지 거치는 채널/터치포인트의 시간순 시퀀스 |
| 어시스트 채널 | 직접 전환(Last-touch)에는 잡히지 않지만 전환 경로에 자주 포함되는 채널 |

## Common Decisions

- 어떤 귀인 모델을 기본 리포팅 기준으로 사용할지
- 어시스트 채널(YouTube, Email, Content 등)에 예산을 재배분할지
- 비효율 캠페인을 중단하고 예산을 고효율 캠페인으로 전환할지
- 멀티터치 전환 경로에서 최적 채널 시퀀스를 표준화할지
- 채널별 예산 배분 비율을 어떻게 조정할지
- 시간에 따른 채널 효율 변화에 대응하여 예산을 재조정할지
