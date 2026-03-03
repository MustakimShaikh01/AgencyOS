# 🤖 Agent Roster Guide

Welcome to the AgencyOS roster! This guide lists all 9 autonomous agents, their authority levels, models, and exact triggers.

## Hierarchy & Authority
If an agent detects a rule violation, they look up their own **Authority Level (1-5)**.
* **Level 1** (Writers): Can generate content, no approval rights.
* **Level 2** (Managers): Generates content spanning specific scopes.
* **Level 3** (Strategist): Breaks down workflows automatically mapping $ budgets.
* **Level 4** (Risk / Finance): Triggers blocks or escalates tasks (i.e., budget overrun).
* **Level 5** (Approver): Full override authority issuing standard REVISION limits.

## The 9 Automated Employees

| Agent Name | Level | Model Choice | Target Schema Output |
|---|---|---|---|
| **Strategist** | 3 | `qwen` | `{ analysis_summary, sub_tasks, confidence_score }` |
| **Content Writer** | 1 | `qwen` | `{ analysis_summary, draft_content, self_review_notes, seo_keywords_used, confidence_score }` |
| **Approver** | 5 | `mistral` | `{ approved, overall_score, dimension_scores, issues, revision_instructions, confidence_score }` |
| **Risk Agent** | 4 | `mistral` | `{ risk_score, risk_flags, risk_categories, escalation_required, recommended_changes }` |
| **Finance Controller**| 4 | `tinyllama` | `{ budget_status, budget_remaining, overrun_percentage, cost_efficiency_score, recommendation }` |
| **SEO Agent** | 2 | `qwen` | `{ primary_keyword, secondary_keywords, meta_title, meta_description, content_suggestions, seo_score }` |
| **Ads Manager** | 2 | `qwen` | `{ targeting_strategy, ad_variations, budget_allocation_advice, expected_ctr_confidence }` |
| **Social Manager** | 2 | `qwen` | `{ platform_adaptations, recommended_hashtags, posting_schedule_recommendation }` |

## Modifying Behaviors
You can entirely rewrite the behavior of a role by opening its file in `app/agents/*.py` and editing its `prompt_template` property. Make sure to update its `validate_output` logic natively or the orchestration loop will panic failing exact structured outputs.
