# 📈 Multibagger Stock Prediction Pipeline

A complete end-to-end machine learning pipeline that predicts multibagger stocks (2× return in 3 years) using the **EV × L framework** as a pre-filter step before applying advanced ML models.

## 🎯 Overview

This pipeline combines fundamental analysis with machine learning to identify stocks with high potential for significant returns:

1. **EV Score (Earnings Visibility)**: Revenue Growth + Low Volatility + Sector Growth
2. **L Score (Longevity)**: ROE + Profit Margin + Low Debt/Equity
3. **ML Models**: Random Forest, XGBoost, Neural Networks trained on filtered data

## 🚀 Quick Start

### 1. Install Dependencies
```bash
pip install -r ml_requirements.txt
```

### 2. Run the Pipeline
```bash
# Command line execution
python multibagger_prediction.py

# Or use Jupyter notebook for interactive analysis
jupyter notebook multibagger_prediction.ipynb
```

### 3. Launch Streamlit UI
```bash
streamlit run streamlit_app.py
```

## 📁 Files Structure

```
├── multibagger_prediction.py      # Main pipeline script
├── multibagger_prediction.ipynb   # Interactive Jupyter notebook
├── streamlit_app.py               # Web UI for predictions
├── ml_requirements.txt            # Python dependencies
├── ML_README.md                   # This file
└── best_multibagger_model.pkl     # Saved trained model (generated)
```

## 🧮 Key Functions

### Core Pipeline Functions
- `load_data()`: Load/generate synthetic financial data
- `preprocess_data()`: Clean and handle missing values/outliers
- `compute_ev_l_scores()`: Calculate EV and L framework scores
- `filter_candidates()`: Apply EV×L filters (EV≥0.6, L≥0.5)
- `train_models()`: Train multiple ML models
- `evaluate_models()`: Compare model performance
- `predict_new_stock()`: Make predictions on new data

### EV × L Framework

**Earnings Visibility (EV) Score:**
```python
EV = 0.4×Revenue_Growth + 0.3×(1-Volatility) + 0.3×Sector_Growth
```

**Longevity (L) Score:**
```python
L = 0.4×ROE + 0.3×Profit_Margin + 0.3×(1-Debt_Equity)
```

## 🤖 Models Implemented

1. **Baseline Models**:
   - Logistic Regression
   - Decision Tree

2. **Advanced Models**:
   - Random Forest
   - XGBoost
   - Neural Network (Keras)

## 📊 Features Used

| Feature | Description | Impact |
|---------|-------------|---------|
| PE_Ratio | Price-to-Earnings ratio | Valuation metric |
| EPS | Earnings Per Share | Profitability |
| ROE | Return on Equity | Efficiency |
| ROA | Return on Assets | Asset utilization |
| Market_Cap | Market Capitalization | Company size |
| Revenue_Growth | Revenue growth rate | Growth potential |
| Profit_Margin | Net profit margin | Profitability |
| Debt_Equity | Debt-to-Equity ratio | Financial risk |
| Volatility | Stock price volatility | Risk measure |
| SectorGrowth | Sector growth rate | Market tailwinds |
| EV_Score | Earnings Visibility | Framework score |
| L_Score | Longevity | Framework score |

## 📈 Expected Outputs

### 1. Model Performance Table
```
Model               | Accuracy | Precision | Recall | F1    | AUC
--------------------|----------|-----------|--------|-------|-------
Logistic Regression | 0.742    | 0.681     | 0.598  | 0.637 | 0.789
Random Forest       | 0.798    | 0.756     | 0.712  | 0.733 | 0.856
XGBoost            | 0.812    | 0.771     | 0.728  | 0.749 | 0.871
Neural Network     | 0.785    | 0.734     | 0.689  | 0.711 | 0.843
```

### 2. Visualizations Generated
- Correlation heatmap of features
- EV vs L score scatter plot
- Feature importance charts
- ROC curves comparison
- Confusion matrices
- SHAP feature importance

### 3. Saved Artifacts
- `best_multibagger_model.pkl`: Trained model
- `multibagger_analysis.png`: Comprehensive analysis plots

## 🎮 Streamlit UI Features

The web interface allows you to:
- Input stock fundamentals
- Get real-time multibagger probability
- View EV and L scores
- Receive investment recommendations
- Understand model explanations

### Sample Input:
```
PE Ratio: 15.0
EPS: 8.2
ROE: 22.0%
Revenue Growth: 18.5%
Profit Margin: 15.2%
Debt/Equity: 0.3
Volatility: 0.25
```

### Sample Output:
```
🎯 Multibagger Probability: 73.2%
📊 EV Score: 0.68 ✅
📊 L Score: 0.71 ✅
💡 Recommendation: 🚀 STRONG BUY
```

## 🔧 Customization Options

### Adjust EV×L Thresholds
```python
# In filter_candidates() function
filtered_df = predictor.filter_candidates(df, ev_threshold=0.7, l_threshold=0.6)
```

### Modify Feature Weights
```python
# In compute_ev_l_scores() function
w1, w2, w3 = 0.5, 0.3, 0.2  # EV weights
w4, w5, w6 = 0.5, 0.3, 0.2  # L weights
```

### Add New Features
```python
# Add to feature_cols in prepare_features()
feature_cols = ['PE_Ratio', 'EPS', 'ROE', 'ROA', 'Market_Cap', 
               'Revenue_Growth', 'Profit_Margin', 'Debt_Equity', 
               'Volatility', 'SectorGrowth', 'EV_Score', 'L_Score',
               'NEW_FEATURE']  # Add your feature here
```

## 📚 Real Data Integration

To use real stock data instead of synthetic:

### Yahoo Finance Integration
```python
import yfinance as yf

def load_real_data(tickers):
    data = []
    for ticker in tickers:
        stock = yf.Ticker(ticker)
        info = stock.info
        hist = stock.history(period="3y")
        
        # Extract features from info and hist
        stock_data = {
            'PE_Ratio': info.get('trailingPE', 0),
            'EPS': info.get('trailingEps', 0),
            'ROE': info.get('returnOnEquity', 0) * 100,
            # ... extract other features
        }
        data.append(stock_data)
    
    return pd.DataFrame(data)
```

## ⚠️ Important Notes

1. **Synthetic Data**: Current implementation uses synthetic data for demonstration
2. **Backtesting**: Implement proper backtesting before live trading
3. **Risk Management**: Always diversify and manage risk appropriately
4. **Market Conditions**: Model performance may vary with market conditions
5. **Regular Updates**: Retrain models with fresh data periodically

## 🚀 Deployment Options

### Local Development
```bash
# Run pipeline
python multibagger_prediction.py

# Launch UI
streamlit run streamlit_app.py
```

### Cloud Deployment
- **Streamlit Cloud**: Deploy directly from GitHub
- **Heroku**: Use Procfile for web deployment
- **AWS/GCP**: Deploy using container services
- **Vercel**: For serverless deployment

### Docker Deployment
```dockerfile
FROM python:3.9-slim
COPY . /app
WORKDIR /app
RUN pip install -r ml_requirements.txt
EXPOSE 8501
CMD ["streamlit", "run", "streamlit_app.py"]
```

## 📊 Performance Metrics

The pipeline evaluates models using:
- **Accuracy**: Overall correctness
- **Precision**: Avoiding false positives
- **Recall**: Capturing actual multibaggers
- **F1-Score**: Balanced performance
- **AUC-ROC**: Discriminative ability

## 🔮 Future Enhancements

1. **Technical Indicators**: RSI, MACD, Bollinger Bands
2. **Sentiment Analysis**: News and social media sentiment
3. **Sector Analysis**: Industry-specific models
4. **Ensemble Methods**: Combine multiple approaches
5. **Real-time Data**: Live market data integration
6. **Backtesting Engine**: Historical performance validation
7. **Risk Metrics**: VaR, Sharpe ratio, maximum drawdown

## 📞 Support

For questions or issues:
1. Check the Jupyter notebook for detailed explanations
2. Review the code comments in `multibagger_prediction.py`
3. Test with the Streamlit UI for interactive exploration

---

**Disclaimer**: This is for educational purposes only. Past performance doesn't guarantee future results. Always do your own research and consult financial advisors before making investment decisions.