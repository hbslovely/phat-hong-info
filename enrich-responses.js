const fs = require('fs');
const path = require('path');

// Read the current interview responses
const responsesPath = path.join(__dirname, 'src/assets/json/interview-responses.json');
const data = JSON.parse(fs.readFileSync(responsesPath, 'utf8'));

// Define enrichment mappings
const categoryMapping = {
  'greeting': ['xin chào', 'chào', 'hello', 'hi'],
  'farewell': ['tạm biệt', 'bye', 'goodbye'],
  'personal': ['tên', 'tuổi', 'sở thích', 'gia đình', 'quê', 'name', 'age', 'hobby', 'family'],
  'professional': ['công việc', 'job', 'work', 'company', 'team', 'experience', 'career'],
  'technical': ['angular', 'react', 'javascript', 'typescript', 'programming', 'development'],
  'educational': ['học', 'trường', 'university', 'education', 'degree'],
  'skills': ['kỹ năng', 'skills', 'ability', 'công nghệ', 'technology'],
  'projects': ['dự án', 'project', 'portfolio'],
  'challenges': ['khó khăn', 'challenge', 'problem', 'difficulty'],
  'future': ['tương lai', 'future', 'plan', 'goal', 'mục tiêu'],
  'comparison': ['so với', 'compare', 'khác', 'different', 'better'],
  'opinion': ['nghĩ', 'think', 'opinion', 'thấy', 'feel'],
  'location': ['ở đâu', 'quê quán', 'where', 'location', 'địa điểm']
};

const complexityMapping = {
  'simple': (answer) => answer.length < 200,
  'moderate': (answer) => answer.length >= 200 && answer.length < 500,
  'complex': (answer) => answer.length >= 500
};

const responseTypeMapping = {
  'greeting_response': ['greeting'],
  'farewell_response': ['farewell'],
  'personal_sharing': ['personal'],
  'work_description': ['professional'],
  'skill_demonstration': ['technical', 'skills'],
  'experience_narrative': ['professional'],
  'explanatory': ['technical'],
  'location_specific': ['location'],
  'comparative_analysis': ['comparison'],
  'opinion_based': ['opinion'],
  'future_oriented': ['future'],
  'direct_answer': ['yes_no'],
  'process_explanation': ['technical']
};

const contextTagsMapping = {
  'social': ['greeting', 'farewell'],
  'biographical': ['personal'],
  'professional': ['professional'],
  'technical': ['technical', 'skills'],
  'educational': ['educational'],
  'geographical': ['location'],
  'comparative': ['comparison'],
  'aspirational': ['future']
};

function determineCategory(keywords) {
  for (const [category, categoryKeywords] of Object.entries(categoryMapping)) {
    if (keywords.some(keyword => 
      categoryKeywords.some(ck => keyword.toLowerCase().includes(ck))
    )) {
      return category;
    }
  }
  return 'general';
}

function determineComplexity(answer) {
  if (answer.length < 200) return 'simple';
  if (answer.length < 500) return 'moderate';
  return 'complex';
}

function determineResponseType(category, keywords) {
  for (const [responseType, categories] of Object.entries(responseTypeMapping)) {
    if (categories.includes(category)) {
      return responseType;
    }
  }
  return 'standard';
}

function determineContextTags(category, keywords) {
  const tags = [];
  for (const [tag, categories] of Object.entries(contextTagsMapping)) {
    if (categories.includes(category)) {
      tags.push(tag);
    }
  }
  
  // Additional context tags based on keywords
  if (keywords.some(k => ['ai', 'machine learning', 'artificial intelligence'].includes(k.toLowerCase()))) {
    tags.push('ai');
  }
  if (keywords.some(k => ['fintech', 'banking', 'financial'].includes(k.toLowerCase()))) {
    tags.push('fintech');
  }
  if (keywords.some(k => ['remote', 'hybrid', 'work style'].includes(k.toLowerCase()))) {
    tags.push('work_style');
  }
  
  return tags.length > 0 ? tags : ['general'];
}

function determineSubcategory(category, keywords) {
  const subcategoryMapping = {
    'personal': {
      'identity': ['tên', 'name'],
      'demographics': ['tuổi', 'age'],
      'interests': ['sở thích', 'hobby'],
      'family': ['gia đình', 'family'],
      'origin': ['quê', 'hometown']
    },
    'technical': {
      'frontend': ['angular', 'react', 'javascript', 'typescript'],
      'programming': ['programming', 'coding', 'development'],
      'tools': ['testing', 'git', 'framework']
    },
    'professional': {
      'current_role': ['backbase', 'current', 'job'],
      'experience': ['kinh nghiệm', 'experience', 'career'],
      'companies': ['company', 'workplace', 'hcl', 'nashtech']
    }
  };

  if (subcategoryMapping[category]) {
    for (const [subcategory, subKeywords] of Object.entries(subcategoryMapping[category])) {
      if (keywords.some(keyword => 
        subKeywords.some(sk => keyword.toLowerCase().includes(sk))
      )) {
        return subcategory;
      }
    }
  }
  
  return 'general';
}

function determinePriority(category, hasFollowUp) {
  if (category === 'greeting' || category === 'farewell') return 'high';
  if (hasFollowUp) return 'high';
  if (['personal', 'professional', 'technical'].includes(category)) return 'medium';
  return 'low';
}

// Enrich each response
data.responses = data.responses.map(response => {
  const category = determineCategory(response.keywords);
  const complexity = determineComplexity(response.answer);
  const responseType = determineResponseType(category, response.keywords);
  const contextTags = determineContextTags(category, response.keywords);
  const subcategory = determineSubcategory(category, response.keywords);
  const hasFollowUp = !!(response.yes || response.no);
  const priority = determinePriority(category, hasFollowUp);

  return {
    ...response,
    category,
    subcategory,
    complexity,
    responseType,
    contextTags,
    priority
  };
});

// Write the enriched data back
fs.writeFileSync(responsesPath, JSON.stringify(data, null, 2), 'utf8');

console.log('Successfully enriched interview-responses.json with:');
console.log('- Categories and subcategories');
console.log('- Complexity levels');
console.log('- Response types');
console.log('- Context tags');
console.log('- Priority levels');
console.log(`Total responses processed: ${data.responses.length}`);

// Generate summary statistics
const stats = {
  categories: {},
  complexities: {},
  responseTypes: {},
  priorities: {}
};

data.responses.forEach(response => {
  stats.categories[response.category] = (stats.categories[response.category] || 0) + 1;
  stats.complexities[response.complexity] = (stats.complexities[response.complexity] || 0) + 1;
  stats.responseTypes[response.responseType] = (stats.responseTypes[response.responseType] || 0) + 1;
  stats.priorities[response.priority] = (stats.priorities[response.priority] || 0) + 1;
});

console.log('\nStatistics:');
console.log('Categories:', stats.categories);
console.log('Complexities:', stats.complexities);
console.log('Response Types:', stats.responseTypes);
console.log('Priorities:', stats.priorities);
