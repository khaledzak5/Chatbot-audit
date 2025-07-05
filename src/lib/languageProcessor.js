// Language and dialect processing utilities for the audit chatbot

// Arabic dialect variations and colloquial expressions
const ARABIC_DIALECT_VARIATIONS = {
  // Standard Arabic to dialect mappings
  'تدقيق': ['تدقيق', 'مراجعة', 'فحص', 'كشف', 'تفتيش', 'مراقبة'],
  'مراجعة': ['مراجعة', 'تدقيق', 'فحص', 'كشف', 'تفتيش', 'مراقبة'],
  'داخلي': ['داخلي', 'داخلي', 'محلي', 'ذاتي'],
  'مدقق': ['مدقق', 'مراجع', 'مفتش', 'كاشف', 'متابع'],
  'مراجع': ['مراجع', 'مدقق', 'مفتش', 'كاشف', 'متابع'],
  'مخاطر': ['مخاطر', 'أخطار', 'تهديدات', 'مشاكل', 'مشكلات'],
  'ضوابط': ['ضوابط', 'إجراءات', 'قواعد', 'أنظمة', 'سياسات'],
  'سياسات': ['سياسات', 'ضوابط', 'إجراءات', 'قواعد', 'أنظمة'],
  'إجراءات': ['إجراءات', 'ضوابط', 'سياسات', 'قواعد', 'أنظمة'],
  'امتثال': ['امتثال', 'التزام', 'طاعة', 'اتباع', 'متابعة'],
  'حوكمة': ['حوكمة', 'إدارة', 'قيادة', 'توجيه', 'إشراف'],
  'أداء': ['أداء', 'كفاءة', 'فعالية', 'إنتاجية', 'جودة'],
  'كفاءة': ['كفاءة', 'أداء', 'فعالية', 'إنتاجية', 'جودة'],
  'فعالية': ['فعالية', 'أداء', 'كفاءة', 'إنتاجية', 'جودة'],
  'جودة': ['جودة', 'أداء', 'كفاءة', 'فعالية', 'إنتاجية'],
  'معايير': ['معايير', 'قواعد', 'أصول', 'مبادئ', 'أسس'],
  'تقارير': ['تقارير', 'تقارير', 'تقارير', 'تقارير', 'تقارير'],
  'توصيات': ['توصيات', 'نصائح', 'إرشادات', 'توجيهات', 'اقتراحات'],
  'متابعة': ['متابعة', 'مراقبة', 'تتبع', 'إشراف', 'رقابة'],
  'تخطيط': ['تخطيط', 'برمجة', 'تنظيم', 'ترتيب', 'إعداد'],
  'تنفيذ': ['تنفيذ', 'تطبيق', 'إنجاز', 'عمل', 'ممارسة'],
  'إبلاغ': ['إبلاغ', 'إخبار', 'إعلام', 'إشعار', 'إعلان'],
  'مراقبة': ['مراقبة', 'متابعة', 'إشراف', 'رقابة', 'تتبع'],
  'تحليل': ['تحليل', 'دراسة', 'فحص', 'بحث', 'استقصاء'],
  'فحص': ['فحص', 'تدقيق', 'مراجعة', 'كشف', 'تفتيش'],
  'اختبار': ['اختبار', 'تجربة', 'فحص', 'كشف', 'تقييم'],
  'تقييم': ['تقييم', 'تقييم', 'تقييم', 'تقييم', 'تقييم'],
  'قياس': ['قياس', 'تقييم', 'تحديد', 'حساب', 'إحصاء'],
  'مؤشرات': ['مؤشرات', 'دلائل', 'علامات', 'إشارات', 'أدلة'],
  'أداء': ['أداء', 'كفاءة', 'فعالية', 'إنتاجية', 'جودة']
};

// English variations and synonyms
const ENGLISH_VARIATIONS = {
  'audit': ['audit', 'review', 'examination', 'inspection', 'assessment', 'evaluation'],
  'internal': ['internal', 'domestic', 'in-house', 'within', 'inside'],
  'review': ['review', 'audit', 'examination', 'inspection', 'assessment'],
  'auditor': ['auditor', 'reviewer', 'examiner', 'inspector', 'assessor'],
  'risk': ['risk', 'hazard', 'threat', 'danger', 'peril'],
  'control': ['control', 'regulation', 'rule', 'procedure', 'policy'],
  'policy': ['policy', 'procedure', 'rule', 'regulation', 'guideline'],
  'procedure': ['procedure', 'process', 'method', 'technique', 'approach'],
  'compliance': ['compliance', 'adherence', 'conformity', 'observance', 'obedience'],
  'governance': ['governance', 'management', 'administration', 'oversight', 'supervision'],
  'performance': ['performance', 'efficiency', 'effectiveness', 'productivity', 'quality'],
  'efficiency': ['efficiency', 'performance', 'effectiveness', 'productivity', 'quality'],
  'effectiveness': ['effectiveness', 'performance', 'efficiency', 'productivity', 'quality'],
  'quality': ['quality', 'performance', 'efficiency', 'effectiveness', 'productivity'],
  'standard': ['standard', 'criterion', 'benchmark', 'norm', 'requirement'],
  'report': ['report', 'document', 'statement', 'summary', 'analysis'],
  'recommendation': ['recommendation', 'suggestion', 'advice', 'guidance', 'proposal'],
  'planning': ['planning', 'scheduling', 'organizing', 'arranging', 'preparing'],
  'execution': ['execution', 'implementation', 'performance', 'carrying out', 'conducting'],
  'monitoring': ['monitoring', 'tracking', 'supervision', 'oversight', 'surveillance'],
  'analysis': ['analysis', 'examination', 'study', 'investigation', 'research'],
  'testing': ['testing', 'examination', 'evaluation', 'assessment', 'trial'],
  'evaluation': ['evaluation', 'assessment', 'appraisal', 'review', 'analysis'],
  'measurement': ['measurement', 'assessment', 'evaluation', 'calculation', 'quantification'],
  'kpi': ['kpi', 'key performance indicator', 'metric', 'measure', 'indicator']
};

// Function to normalize text by expanding variations
export function normalizeText(text) {
  let normalizedText = text.toLowerCase().trim();
  
  // Replace Arabic dialect variations
  Object.entries(ARABIC_DIALECT_VARIATIONS).forEach(([standard, variations]) => {
    variations.forEach(variation => {
      const regex = new RegExp(`\\b${variation}\\b`, 'gi');
      normalizedText = normalizedText.replace(regex, standard);
    });
  });
  
  // Replace English variations
  Object.entries(ENGLISH_VARIATIONS).forEach(([standard, variations]) => {
    variations.forEach(variation => {
      const regex = new RegExp(`\\b${variation}\\b`, 'gi');
      normalizedText = normalizedText.replace(regex, standard);
    });
  });
  
  return normalizedText;
}

// Function to detect language
export function detectLanguage(text) {
  const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
  const englishRegex = /[a-zA-Z]/;
  
  const hasArabic = arabicRegex.test(text);
  const hasEnglish = englishRegex.test(text);
  
  if (hasArabic && hasEnglish) {
    return 'mixed';
  } else if (hasArabic) {
    return 'arabic';
  } else if (hasEnglish) {
    return 'english';
  } else {
    return 'unknown';
  }
}

// Function to extract key concepts from text
export function extractKeyConcepts(text) {
  const concepts = [];
  const normalizedText = normalizeText(text);
  
  // Extract Arabic concepts
  Object.keys(ARABIC_DIALECT_VARIATIONS).forEach(concept => {
    if (normalizedText.includes(concept)) {
      concepts.push(concept);
    }
  });
  
  // Extract English concepts
  Object.keys(ENGLISH_VARIATIONS).forEach(concept => {
    if (normalizedText.includes(concept)) {
      concepts.push(concept);
    }
  });
  
  return concepts;
}

// Function to enhance question understanding
export function enhanceQuestionUnderstanding(question) {
  const language = detectLanguage(question);
  const concepts = extractKeyConcepts(question);
  const normalizedQuestion = normalizeText(question);
  
  return {
    original: question,
    normalized: normalizedQuestion,
    language: language,
    concepts: concepts,
    isAuditRelated: concepts.length > 0
  };
}

// Function to create enhanced search query
export function createEnhancedSearchQuery(question) {
  const analysis = enhanceQuestionUnderstanding(question);
  
  // If no audit concepts found, try to expand the search
  if (analysis.concepts.length === 0) {
    // Add common audit-related terms for broader search
    const expandedTerms = [
      'تدقيق', 'مراجعة', 'داخلي', 'مدقق', 'مراجع',
      'audit', 'internal', 'review', 'auditor', 'reviewer'
    ];
    
    return {
      ...analysis,
      enhancedQuery: question + ' ' + expandedTerms.join(' '),
      searchStrategy: 'expanded'
    };
  }
  
  return {
    ...analysis,
    enhancedQuery: question,
    searchStrategy: 'concept-based'
  };
} 