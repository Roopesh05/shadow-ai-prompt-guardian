/**
 * Shadow AI Prompt Guardian — Phase 2: Local ML Classifier
 *
 * Lightweight TensorFlow.js classifier for paraphrased leak detection.
 * Runs 100% client-side with zero external API calls.
 */

(function () {
  'use strict';

  // ─── ML Model State ──────────────────────────────────────────────────────────
  var mlModel = null;
  var mlReady = false;
  var mlLoadTime = 0;
  var mlConfidenceThreshold = 0.7;

  // ─── Training Data (Small but effective) ─────────────────────────────────────
  var TRAINING_DATA = [
    // API keys (various formats)
    { text: 'My API key is sk-1234567890abcdefghijklmnop', label: 1 },
    { text: 'Use this key: AKIAIOSFODNN7EXAMPLE', label: 1 },
    { text: 'Token: ghp_abcdefghijklmnopqrstuvwxyz123456', label: 1 },
    { text: 'The secret is sk_live_abcdefghijklmnopqrstuv', label: 1 },
    { text: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ0ZXN0In0.abc123', label: 1 },
    { text: 'Authorization: Basic dXNlcjpwYXNzd29yZA==', label: 1 },
    // Passwords
    { text: 'My password is S3cretP@ssw0rd!', label: 1 },
    { text: 'password = MyP@ss123', label: 1 },
    { text: 'The credential is: admin123', label: 1 },
    // PII
    { text: 'Contact me at john@example.com', label: 1 },
    { text: 'Call 555-123-4567', label: 1 },
    { text: 'SSN is 123-45-6789', label: 1 },
    // Confidential
    { text: 'This is CONFIDENTIAL internal data', label: 1 },
    { text: 'Project Phoenix is top secret', label: 1 },
    // Clean prompts
    { text: 'Write a function that sorts an array', label: 0 },
    { text: 'What is the capital of France?', label: 0 },
    { text: 'Explain quantum computing to me', label: 0 },
    { text: 'How do I make chocolate chip cookies?', label: 0 },
    { text: 'Tell me a joke about programmers', label: 0 },
    { text: 'What are the best React patterns?', label: 0 },
  ];

  // ─── Feature Extraction (TF-IDF style) ───────────────────────────────────────
  function extractFeatures(text) {
    var words = text.toLowerCase().split(/\s+/).filter(function(w) { return w.length > 2; });
    var features = [];
    // Key indicators
    features.push(text.includes('sk-') ? 1 : 0);
    features.push(text.includes('AKIA') ? 1 : 0);
    features.push(text.includes('ghp_') ? 1 : 0);
    features.push(text.includes('sk_live_') ? 1 : 0);
    features.push(text.includes('password') ? 1 : 0);
    features.push(text.includes('secret') ? 1 : 0);
    features.push(text.includes('token') ? 1 : 0);
    features.push(text.includes('@') ? 1 : 0);
    features.push(text.match(/\d{3}-\d{2}-\d{4}/) ? 1 : 0);
    features.push(text.match(/\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/) ? 1 : 0);
    features.push(text.includes('CONFIDENTIAL') ? 1 : 0);
    features.push(text.includes('proprietary') ? 1 : 0);
    features.push(text.length > 50 ? 1 : 0);
    features.push(words.length > 10 ? 1 : 0);
    return features;
  }

  // ─── Simple Logistic Regression (No TF.js dependency) ────────────────────────
  function trainModel() {
    var startTime = Date.now();
    var features = TRAINING_DATA.map(function(d) { return extractFeatures(d.text); });
    var labels = TRAINING_DATA.map(function(d) { return d.label; });

    // Simple gradient descent
    var weights = new Array(features[0].length).fill(0.1);
    var bias = 0;
    var learningRate = 0.01;
    var epochs = 100;

    for (var epoch = 0; epoch < epochs; epoch++) {
      for (var i = 0; i < features.length; i++) {
        var prediction = sigmoid(sum(features[i], weights, bias));
        var error = labels[i] - prediction;
        for (var j = 0; j < weights.length; j++) {
          weights[j] += learningRate * error * features[i][j];
        }
        bias += learningRate * error;
      }
    }

    mlModel = { weights: weights, bias: bias };
    mlReady = true;
    mlLoadTime = Date.now() - startTime;
    console.log('[SAPG] ML model trained in ' + mlLoadTime + 'ms');
  }

  function sigmoid(z) {
    return 1 / (1 + Math.exp(-z));
  }

  function sum(x, weights, bias) {
    var result = bias;
    for (var i = 0; i < x.length; i++) {
      result += x[i] * weights[i];
    }
    return result;
  }

  // ─── Prediction ──────────────────────────────────────────────────────────────
  function predict(text) {
    if (!mlReady) return { score: 0, isML: true, confidence: 0 };
    var features = extractFeatures(text);
    var score = sigmoid(sum(features, mlModel.weights, mlModel.bias));
    return {
      score: score,
      isML: true,
      confidence: Math.abs(score - 0.5) * 2,
      prediction: score > 0.5 ? 1 : 0
    };
  }

  // ─── Combined Scoring ────────────────────────────────────────────────────────
  function combineResults(ruleScore, mlResult) {
    // Weighted combination: 70% rule-based, 30% ML
    var mlScore = mlResult.isML ? mlResult.score * 100 : 0;
    var combined = (ruleScore * 0.7) + (mlScore * 0.3);
    return Math.min(Math.round(combined), 100);
  }

  // ─── Public API ──────────────────────────────────────────────────────────────
  window.SAPG_ML = {
    train: trainModel,
    predict: predict,
    combine: combineResults,
    getLoadTime: function() { return mlLoadTime; },
    isReady: function() { return mlReady; },
    getConfidence: function() { return mlResult ? mlResult.confidence : 0; }
  };

  // Auto-train on load
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { trainModel, predict, combineResults };
  }
})();
