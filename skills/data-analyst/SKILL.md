---
name: data-analyst
description: Automated data analysis, statistical metric computation, and summary reporting.
version: 1.0.0
author: Hackathon Team
tags:
  - analytics
  - data
  - statistics
---

# Data Analyst Skill

## Purpose
This skill equips the agent to perform exploratory data analysis (EDA), calculate key statistical metrics (mean, median, standard deviation, percentiles), detect anomalies, and generate structured markdown analytical reports.

## When to Use
- When asked to analyze numbers, CSV tables, financial data, or user metric datasets.
- When summarizing distributions or finding outliers.

## Operational Instructions
1. **Schema & Data Ingestion**:
   - Inspect the input format (columns, data types, null values).
   - Validate numerical columns vs categorical fields.
2. **Compute Statistical Measures**:
   - Compute count, mean, min, max, variance, and standard deviation.
   - Identify top 3 anomalous data points if applicable.
3. **Report Generation**:
   - Present results in clean GitHub-Flavored Markdown tables.
   - Conclude with actionable business recommendations.
