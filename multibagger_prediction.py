#!/usr/bin/env python3
"""
Multibagger Stock Prediction Pipeline using EV × L Framework
Predicts stocks with 2x+ returns in 3 years using fundamental analysis + ML
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split, GridSearchCV, TimeSeriesSplit
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score, confusion_matrix, roc_curve
import xgboost as xgb
from tensorflow import keras
import shap
import pickle
import warnings
warnings.filterwarnings('ignore')

class MultibaggerPredictor:
    def __init__(self):
        self.scaler = StandardScaler()
        self.models = {}
        self.best_model = None
        
    def load_data(self, generate_synthetic=True):
        """Load or generate synthetic stock data"""
        if generate_synthetic:
            np.random.seed(42)
            n_samples = 2000
            
            data = {
                'PE_Ratio': np.random.normal(15, 8, n_samples),
                'EPS': np.random.normal(5, 3, n_samples),
                'ROE': np.random.normal(15, 10, n_samples),
                'ROA': np.random.normal(8, 5, n_samples),
                'Market_Cap': np.random.lognormal(10, 2, n_samples),
                'Revenue_Growth': np.random.normal(12, 15, n_samples),
                'Profit_Margin': np.random.normal(8, 6, n_samples),
                'Debt_Equity': np.random.normal(0.5, 0.4, n_samples),
                'Volatility': np.random.normal(0.3, 0.2, n_samples),
                'SectorGrowth': np.random.normal(10, 8, n_samples),
                'Price_3yr_Return': np.random.lognormal(0.5, 0.8, n_samples)
            }
            
            df = pd.DataFrame(data)
            df['multibagger'] = (df['Price_3yr_Return'] >= 2.0).astype(int)
            
            # Add some realistic correlations
            df.loc[df['ROE'] > 20, 'multibagger'] = np.random.choice([0, 1], 
                                                                   size=sum(df['ROE'] > 20), 
                                                                   p=[0.3, 0.7])
            df.loc[df['Revenue_Growth'] > 25, 'multibagger'] = np.random.choice([0, 1], 
                                                                              size=sum(df['Revenue_Growth'] > 25), 
                                                                              p=[0.4, 0.6])
            
            return df
        
    def preprocess_data(self, df):
        """Clean and preprocess the data"""
        # Handle missing values
        df = df.fillna(df.median())
        
        # Remove outliers (3 sigma rule)
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        for col in numeric_cols:
            if col != 'multibagger':
                mean, std = df[col].mean(), df[col].std()
                df = df[(df[col] >= mean - 3*std) & (df[col] <= mean + 3*std)]
        
        # Ensure positive values for ratios
        df['PE_Ratio'] = np.abs(df['PE_Ratio'])
        df['Debt_Equity'] = np.abs(df['Debt_Equity'])
        df['Volatility'] = np.abs(df['Volatility'])
        
        return df
    
    def compute_ev_l_scores(self, df):
        """Compute Earnings Visibility (EV) and Longevity (L) scores"""
        # Normalize features to 0-1 scale
        def normalize(series):
            return (series - series.min()) / (series.max() - series.min())
        
        # EV Score: Revenue Growth + Low Volatility + Sector Growth
        ev_components = {
            'revenue_norm': normalize(df['Revenue_Growth']),
            'volatility_norm': 1 - normalize(df['Volatility']),  # Lower volatility is better
            'sector_norm': normalize(df['SectorGrowth'])
        }
        
        # Weights for EV components
        w1, w2, w3 = 0.4, 0.3, 0.3
        df['EV_Score'] = (w1 * ev_components['revenue_norm'] + 
                         w2 * ev_components['volatility_norm'] + 
                         w3 * ev_components['sector_norm'])
        
        # L Score: ROE + Profit Margin + Low Debt
        l_components = {
            'roe_norm': normalize(df['ROE']),
            'margin_norm': normalize(df['Profit_Margin']),
            'debt_norm': 1 - normalize(df['Debt_Equity'])  # Lower debt is better
        }
        
        # Weights for L components
        w4, w5, w6 = 0.4, 0.3, 0.3
        df['L_Score'] = (w4 * l_components['roe_norm'] + 
                        w5 * l_components['margin_norm'] + 
                        w6 * l_components['debt_norm'])
        
        return df
    
    def filter_candidates(self, df, ev_threshold=0.6, l_threshold=0.5):
        """Filter stocks based on EV and L scores"""
        filtered_df = df[(df['EV_Score'] >= ev_threshold) & (df['L_Score'] >= l_threshold)]
        print(f"Filtered from {len(df)} to {len(filtered_df)} stocks ({len(filtered_df)/len(df)*100:.1f}%)")
        return filtered_df
    
    def prepare_features(self, df):
        """Prepare feature matrix for ML models"""
        feature_cols = ['PE_Ratio', 'EPS', 'ROE', 'ROA', 'Market_Cap', 
                       'Revenue_Growth', 'Profit_Margin', 'Debt_Equity', 
                       'Volatility', 'SectorGrowth', 'EV_Score', 'L_Score']
        
        X = df[feature_cols]
        y = df['multibagger']
        
        return X, y
    
    def train_models(self, X_train, y_train, X_val, y_val):
        """Train multiple ML models"""
        models = {
            'Logistic Regression': LogisticRegression(random_state=42),
            'Decision Tree': DecisionTreeClassifier(random_state=42, max_depth=10),
            'Random Forest': RandomForestClassifier(n_estimators=100, random_state=42),
            'XGBoost': xgb.XGBClassifier(random_state=42, eval_metric='logloss')
        }
        
        # Train models
        for name, model in models.items():
            print(f"Training {name}...")
            model.fit(X_train, y_train)
            self.models[name] = model
        
        # Simple Neural Network
        print("Training Neural Network...")
        nn_model = keras.Sequential([
            keras.layers.Dense(64, activation='relu', input_shape=(X_train.shape[1],)),
            keras.layers.Dropout(0.3),
            keras.layers.Dense(32, activation='relu'),
            keras.layers.Dropout(0.3),
            keras.layers.Dense(1, activation='sigmoid')
        ])
        
        nn_model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])
        nn_model.fit(X_train, y_train, epochs=50, batch_size=32, 
                    validation_data=(X_val, y_val), verbose=0)
        
        self.models['Neural Network'] = nn_model
        
        return self.models
    
    def evaluate_models(self, X_test, y_test):
        """Evaluate all trained models"""
        results = []
        
        for name, model in self.models.items():
            if name == 'Neural Network':
                y_pred_proba = model.predict(X_test).flatten()
                y_pred = (y_pred_proba > 0.5).astype(int)
            else:
                y_pred = model.predict(X_test)
                y_pred_proba = model.predict_proba(X_test)[:, 1]
            
            # Calculate metrics
            accuracy = accuracy_score(y_test, y_pred)
            precision = precision_score(y_test, y_pred)
            recall = recall_score(y_test, y_pred)
            f1 = f1_score(y_test, y_pred)
            auc = roc_auc_score(y_test, y_pred_proba)
            
            results.append({
                'Model': name,
                'Accuracy': accuracy,
                'Precision': precision,
                'Recall': recall,
                'F1': f1,
                'AUC': auc
            })
        
        results_df = pd.DataFrame(results)
        print("\nModel Evaluation Results:")
        print(results_df.round(4))
        
        # Find best model based on F1 score
        best_idx = results_df['F1'].idxmax()
        best_model_name = results_df.loc[best_idx, 'Model']
        self.best_model = self.models[best_model_name]
        print(f"\nBest Model: {best_model_name}")
        
        return results_df
    
    def plot_results(self, df, X_test, y_test):
        """Generate visualization plots"""
        fig, axes = plt.subplots(2, 2, figsize=(15, 12))
        
        # 1. Correlation Heatmap
        corr_matrix = df.select_dtypes(include=[np.number]).corr()
        sns.heatmap(corr_matrix, annot=True, cmap='coolwarm', center=0, ax=axes[0,0])
        axes[0,0].set_title('Feature Correlation Heatmap')
        
        # 2. EV vs L Score Distribution
        scatter = axes[0,1].scatter(df['EV_Score'], df['L_Score'], 
                                   c=df['multibagger'], cmap='viridis', alpha=0.6)
        axes[0,1].set_xlabel('EV Score')
        axes[0,1].set_ylabel('L Score')
        axes[0,1].set_title('EV vs L Score Distribution')
        plt.colorbar(scatter, ax=axes[0,1])
        
        # 3. Feature Importance (Random Forest)
        if 'Random Forest' in self.models:
            rf_model = self.models['Random Forest']
            feature_names = ['PE_Ratio', 'EPS', 'ROE', 'ROA', 'Market_Cap', 
                           'Revenue_Growth', 'Profit_Margin', 'Debt_Equity', 
                           'Volatility', 'SectorGrowth', 'EV_Score', 'L_Score']
            
            importances = rf_model.feature_importances_
            indices = np.argsort(importances)[::-1][:10]
            
            axes[1,0].bar(range(10), importances[indices])
            axes[1,0].set_xticks(range(10))
            axes[1,0].set_xticklabels([feature_names[i] for i in indices], rotation=45)
            axes[1,0].set_title('Top 10 Feature Importances (Random Forest)')
        
        # 4. ROC Curve
        for name, model in self.models.items():
            if name == 'Neural Network':
                y_pred_proba = model.predict(X_test).flatten()
            else:
                y_pred_proba = model.predict_proba(X_test)[:, 1]
            
            fpr, tpr, _ = roc_curve(y_test, y_pred_proba)
            auc_score = roc_auc_score(y_test, y_pred_proba)
            axes[1,1].plot(fpr, tpr, label=f'{name} (AUC = {auc_score:.3f})')
        
        axes[1,1].plot([0, 1], [0, 1], 'k--')
        axes[1,1].set_xlabel('False Positive Rate')
        axes[1,1].set_ylabel('True Positive Rate')
        axes[1,1].set_title('ROC Curves')
        axes[1,1].legend()
        
        plt.tight_layout()
        plt.savefig('multibagger_analysis.png', dpi=300, bbox_inches='tight')
        plt.show()
    
    def save_model(self, filename='best_multibagger_model.pkl'):
        """Save the best trained model"""
        with open(filename, 'wb') as f:
            pickle.dump({
                'model': self.best_model,
                'scaler': self.scaler,
                'feature_names': ['PE_Ratio', 'EPS', 'ROE', 'ROA', 'Market_Cap', 
                                'Revenue_Growth', 'Profit_Margin', 'Debt_Equity', 
                                'Volatility', 'SectorGrowth', 'EV_Score', 'L_Score']
            }, f)
        print(f"Model saved as {filename}")
    
    def predict_new_stock(self, input_data):
        """Predict multibagger probability for new stock data"""
        if self.best_model is None:
            raise ValueError("No trained model available. Train models first.")
        
        # Convert to DataFrame if needed
        if isinstance(input_data, dict):
            input_df = pd.DataFrame([input_data])
        else:
            input_df = input_data.copy()
        
        # Compute EV and L scores
        input_df = self.compute_ev_l_scores(input_df)
        
        # Prepare features
        feature_cols = ['PE_Ratio', 'EPS', 'ROE', 'ROA', 'Market_Cap', 
                       'Revenue_Growth', 'Profit_Margin', 'Debt_Equity', 
                       'Volatility', 'SectorGrowth', 'EV_Score', 'L_Score']
        
        X_new = input_df[feature_cols]
        X_new_scaled = self.scaler.transform(X_new)
        
        # Make prediction
        if hasattr(self.best_model, 'predict_proba'):
            probability = self.best_model.predict_proba(X_new_scaled)[0, 1]
        else:  # Neural Network
            probability = self.best_model.predict(X_new_scaled)[0, 0]
        
        return probability

def main():
    """Main execution pipeline"""
    print("🚀 Multibagger Stock Prediction Pipeline")
    print("=" * 50)
    
    # Initialize predictor
    predictor = MultibaggerPredictor()
    
    # Step 1: Load and preprocess data
    print("\n📊 Loading and preprocessing data...")
    df = predictor.load_data(generate_synthetic=True)
    df = predictor.preprocess_data(df)
    print(f"Dataset shape: {df.shape}")
    print(f"Multibagger ratio: {df['multibagger'].mean():.2%}")
    
    # Step 2: Compute EV and L scores
    print("\n🔍 Computing EV and L scores...")
    df = predictor.compute_ev_l_scores(df)
    
    # Step 3: Filter candidates
    print("\n🎯 Filtering candidates using EV × L framework...")
    filtered_df = predictor.filter_candidates(df)
    
    # Step 4: Prepare features and split data
    print("\n⚙️ Preparing features and splitting data...")
    X, y = predictor.prepare_features(filtered_df)
    
    # Time-based split simulation
    split_idx = int(0.7 * len(X))
    val_idx = int(0.85 * len(X))
    
    X_train, y_train = X.iloc[:split_idx], y.iloc[:split_idx]
    X_val, y_val = X.iloc[split_idx:val_idx], y.iloc[split_idx:val_idx]
    X_test, y_test = X.iloc[val_idx:], y.iloc[val_idx:]
    
    # Scale features
    X_train_scaled = predictor.scaler.fit_transform(X_train)
    X_val_scaled = predictor.scaler.transform(X_val)
    X_test_scaled = predictor.scaler.transform(X_test)
    
    print(f"Train: {X_train.shape}, Val: {X_val.shape}, Test: {X_test.shape}")
    
    # Step 5: Train models
    print("\n🤖 Training ML models...")
    models = predictor.train_models(X_train_scaled, y_train, X_val_scaled, y_val)
    
    # Step 6: Evaluate models
    print("\n📈 Evaluating models...")
    results = predictor.evaluate_models(X_test_scaled, y_test)
    
    # Step 7: Generate visualizations
    print("\n📊 Generating visualizations...")
    predictor.plot_results(filtered_df, X_test_scaled, y_test)
    
    # Step 8: Save best model
    print("\n💾 Saving best model...")
    predictor.save_model()
    
    # Step 9: Example prediction
    print("\n🔮 Example prediction:")
    sample_stock = {
        'PE_Ratio': 12.5,
        'EPS': 8.2,
        'ROE': 22.0,
        'ROA': 12.5,
        'Market_Cap': 5000000000,
        'Revenue_Growth': 18.5,
        'Profit_Margin': 15.2,
        'Debt_Equity': 0.3,
        'Volatility': 0.25,
        'SectorGrowth': 12.0
    }
    
    probability = predictor.predict_new_stock(sample_stock)
    print(f"Multibagger Probability: {probability:.2%}")
    
    print("\n✅ Pipeline completed successfully!")

if __name__ == "__main__":
    main()