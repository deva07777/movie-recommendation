import streamlit as st
import pandas as pd
import numpy as np
import pickle
from multibagger_prediction import MultibaggerPredictor

st.set_page_config(
    page_title="Multibagger Stock Predictor",
    page_icon="📈",
    layout="wide"
)

@st.cache_resource
def load_trained_model():
    """Load the trained model"""
    try:
        with open('best_multibagger_model.pkl', 'rb') as f:
            model_data = pickle.load(f)
        return model_data
    except FileNotFoundError:
        return None

def main():
    st.title("📈 Multibagger Stock Predictor")
    st.markdown("*Predict stocks with 2x+ returns using EV × L framework + ML*")
    
    # Sidebar for model info
    st.sidebar.header("About")
    st.sidebar.info("""
    This tool predicts multibagger stocks using:
    - **EV Score**: Earnings Visibility (Revenue Growth + Low Volatility + Sector Growth)
    - **L Score**: Longevity (ROE + Profit Margin + Low Debt)
    - **ML Models**: Advanced algorithms trained on filtered data
    """)
    
    # Load model
    model_data = load_trained_model()
    
    if model_data is None:
        st.error("❌ No trained model found. Please run the training pipeline first.")
        st.code("python multibagger_prediction.py")
        return
    
    st.success("✅ Model loaded successfully!")
    
    # Input form
    st.header("📊 Enter Stock Fundamentals")
    
    col1, col2, col3 = st.columns(3)
    
    with col1:
        st.subheader("Valuation Metrics")
        pe_ratio = st.number_input("PE Ratio", value=15.0, min_value=0.1, max_value=100.0)
        eps = st.number_input("EPS", value=5.0, min_value=-50.0, max_value=100.0)
        market_cap = st.number_input("Market Cap (in billions)", value=5.0, min_value=0.01, max_value=1000.0)
        market_cap_actual = market_cap * 1e9  # Convert to actual value
    
    with col2:
        st.subheader("Profitability Metrics")
        roe = st.number_input("ROE (%)", value=15.0, min_value=-50.0, max_value=100.0)
        roa = st.number_input("ROA (%)", value=8.0, min_value=-50.0, max_value=50.0)
        profit_margin = st.number_input("Profit Margin (%)", value=8.0, min_value=-50.0, max_value=50.0)
    
    with col3:
        st.subheader("Growth & Risk Metrics")
        revenue_growth = st.number_input("Revenue Growth (%)", value=12.0, min_value=-50.0, max_value=100.0)
        debt_equity = st.number_input("Debt/Equity Ratio", value=0.5, min_value=0.0, max_value=5.0)
        volatility = st.number_input("Volatility", value=0.3, min_value=0.01, max_value=2.0)
        sector_growth = st.number_input("Sector Growth (%)", value=10.0, min_value=-20.0, max_value=50.0)
    
    # Prediction button
    if st.button("🔮 Predict Multibagger Probability", type="primary"):
        # Prepare input data
        input_data = {
            'PE_Ratio': pe_ratio,
            'EPS': eps,
            'ROE': roe,
            'ROA': roa,
            'Market_Cap': market_cap_actual,
            'Revenue_Growth': revenue_growth,
            'Profit_Margin': profit_margin,
            'Debt_Equity': debt_equity,
            'Volatility': volatility,
            'SectorGrowth': sector_growth
        }
        
        # Create predictor instance and set loaded model
        predictor = MultibaggerPredictor()
        predictor.best_model = model_data['model']
        predictor.scaler = model_data['scaler']
        
        try:
            # Make prediction
            probability = predictor.predict_new_stock(input_data)
            
            # Display results
            st.header("🎯 Prediction Results")
            
            col1, col2, col3 = st.columns(3)
            
            with col1:
                st.metric("Multibagger Probability", f"{probability:.1%}")
            
            with col2:
                if probability >= 0.7:
                    st.success("🚀 High Potential")
                elif probability >= 0.5:
                    st.warning("⚡ Moderate Potential")
                else:
                    st.error("⚠️ Low Potential")
            
            with col3:
                risk_level = "Low" if volatility < 0.3 else "Medium" if volatility < 0.6 else "High"
                st.info(f"Risk Level: {risk_level}")
            
            # Compute and display EV and L scores
            input_df = pd.DataFrame([input_data])
            input_df = predictor.compute_ev_l_scores(input_df)
            
            ev_score = input_df['EV_Score'].iloc[0]
            l_score = input_df['L_Score'].iloc[0]
            
            st.subheader("📊 EV × L Framework Scores")
            
            col1, col2 = st.columns(2)
            
            with col1:
                st.metric("EV Score (Earnings Visibility)", f"{ev_score:.3f}")
                if ev_score >= 0.6:
                    st.success("✅ Passes EV filter")
                else:
                    st.warning("⚠️ Below EV threshold (0.6)")
            
            with col2:
                st.metric("L Score (Longevity)", f"{l_score:.3f}")
                if l_score >= 0.5:
                    st.success("✅ Passes L filter")
                else:
                    st.warning("⚠️ Below L threshold (0.5)")
            
            # Investment recommendation
            st.subheader("💡 Investment Recommendation")
            
            if probability >= 0.7 and ev_score >= 0.6 and l_score >= 0.5:
                st.success("""
                🎯 **STRONG BUY**: This stock shows excellent multibagger potential with:
                - High ML prediction probability
                - Strong earnings visibility
                - Good business longevity indicators
                """)
            elif probability >= 0.5:
                st.warning("""
                ⚡ **MODERATE BUY**: This stock shows decent potential but consider:
                - Moderate prediction probability
                - Review EV/L scores for fundamental strength
                - Consider portfolio diversification
                """)
            else:
                st.error("""
                ⚠️ **AVOID/HOLD**: This stock shows low multibagger potential:
                - Low prediction probability
                - May not meet fundamental criteria
                - Consider other opportunities
                """)
                
        except Exception as e:
            st.error(f"Error making prediction: {str(e)}")
    
    # Additional information
    st.header("📚 How It Works")
    
    with st.expander("EV × L Framework Explained"):
        st.markdown("""
        **Earnings Visibility (EV) Score:**
        - Revenue Growth (40%): Higher growth indicates better earnings potential
        - Low Volatility (30%): Stable stocks are more predictable
        - Sector Growth (30%): Growing sectors provide tailwinds
        
        **Longevity (L) Score:**
        - ROE (40%): Return on Equity indicates efficient capital use
        - Profit Margin (30%): Higher margins show pricing power
        - Low Debt/Equity (30%): Lower debt reduces financial risk
        
        **ML Prediction:**
        - Trained on stocks filtered by EV ≥ 0.6 and L ≥ 0.5
        - Uses ensemble of models: Random Forest, XGBoost, Neural Networks
        - Predicts probability of 2x+ returns in 3 years
        """)
    
    with st.expander("Model Performance"):
        st.markdown("""
        The model has been trained and validated on historical data with:
        - **Precision**: Focus on reducing false positives
        - **Recall**: Capturing actual multibaggers
        - **F1-Score**: Balanced performance metric
        - **AUC**: Overall discriminative ability
        
        *Note: Past performance doesn't guarantee future results. Always do your own research.*
        """)

if __name__ == "__main__":
    main()