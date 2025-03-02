/**
 * Data Scraping and Analysis Example
 * 
 * This example demonstrates how to:
 * 1. Use BrowserAgent to scrape structured data from multiple websites
 * 2. Extract and clean the data
 * 3. Perform analysis on the collected data
 * 4. Output the results in various formats
 */

import { BrowserAgent, PlannerAgent } from '../src/core/agents';
import { logger } from '../src/core/utils/logger';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

interface NewsArticle {
  title: string;
  source: string;
  date: string;
  url: string;
  summary: string;
  topics: string[];
}

async function runDataScrapingExample() {
  // Create agents with custom configurations
  const browserAgent = new BrowserAgent({
    modelName: 'gpt-4o-2024-05-13',
    maxRetries: 3
  });
  
  const plannerAgent = new PlannerAgent({
    modelName: 'gpt-4o-2024-05-13',
    temperature: 0.1
  });
  
  try {
    logger.info('Starting data scraping and analysis example');
    
    // Define the objective
    const topic = 'artificial intelligence';
    const objective = `Collect and analyze the latest news articles about ${topic} from multiple technology news websites`;
    
    // Step 1: Generate a plan for data collection
    logger.info('Generating data collection plan');
    const plan = await plannerAgent.generatePlan(objective);
    logger.info('Generated plan with steps:', { steps: plan.length });
    
    // Step 2: Execute the plan and collect data
    const articles: NewsArticle[] = [];
    const sources = [
      'techcrunch.com',
      'wired.com',
      'theverge.com',
      'venturebeat.com'
    ];
    
    for (const source of sources) {
      logger.info(`Collecting articles from ${source}`);
      
      // Navigate to the source and search for the topic
      const searchPrompt = `Go to ${source} and find the most recent articles about ${topic}`;
      await browserAgent.navigate(searchPrompt);
      
      // Extract article data
      const extractionPrompt = `
        Extract information about the 3 most recent articles on ${topic} from this page.
        For each article, provide:
        1. Title
        2. Publication date
        3. URL
        4. A brief summary (2-3 sentences)
        5. Main topics or tags

        Format as a valid JSON array of objects with the following structure:
        [
          {
            "title": "Article title",
            "source": "${source}",
            "date": "Publication date",
            "url": "Article URL",
            "summary": "Brief summary",
            "topics": ["topic1", "topic2"]
          }
        ]
      `;
      
      try {
        const extractedData = await browserAgent.navigate(extractionPrompt);
        logger.debug('Extraction result', { data: extractedData.substring(0, 100) + '...' });
        
        // Parse the extracted data
        try {
          // Find JSON in the response (it might be surrounded by other text)
          const jsonMatch = extractedData.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            const extractedArticles = JSON.parse(jsonMatch[0]) as NewsArticle[];
            
            // Validate and clean the data
            const validArticles = extractedArticles.filter(article => 
              article.title && 
              article.url && 
              article.summary
            );
            
            articles.push(...validArticles);
            logger.info(`Successfully extracted ${validArticles.length} articles from ${source}`);
          } else {
            logger.warn(`No JSON data found in extraction result from ${source}`);
          }
        } catch (parseError) {
          logger.error('Failed to parse extracted data', { 
            error: parseError.message, 
            source
          });
          
          // Attempt recovery with a simplified extraction
          logger.info('Attempting recovery with simplified extraction');
          const recoveryPrompt = `
            List the titles and URLs of the 3 most recent articles about ${topic} on this page.
            Format each as "Title: [title] | URL: [url]" on a new line.
          `;
          
          const recoveryResult = await browserAgent.navigate(recoveryPrompt);
          
          // Parse the simplified format
          const lines = recoveryResult.split('\n').filter(line => line.includes('Title:') && line.includes('URL:'));
          
          for (const line of lines) {
            const titleMatch = line.match(/Title: (.*?) \|/);
            const urlMatch = line.match(/URL: (.*?)$/);
            
            if (titleMatch && urlMatch) {
              articles.push({
                title: titleMatch[1],
                source: source,
                date: new Date().toISOString().split('T')[0], // Use today's date as fallback
                url: urlMatch[1],
                summary: `Article about ${topic} from ${source}`,
                topics: [topic]
              });
            }
          }
          
          logger.info(`Recovered ${lines.length} articles with simplified extraction`);
        }
      } catch (extractionError) {
        logger.error('Extraction failed', { 
          error: extractionError.message,
          source
        });
      }
    }
    
    // Step 3: Analyze the collected data
    logger.info(`Analysis phase - Processing ${articles.length} articles`);
    
    // Skip analysis if no articles were found
    if (articles.length === 0) {
      logger.warn('No articles collected, skipping analysis');
    } else {
      // Perform basic analysis
      const sourceDistribution = articles.reduce((acc, article) => {
        acc[article.source] = (acc[article.source] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      // Collect all topics
      const allTopics = articles.flatMap(article => article.topics);
      const topicFrequency = allTopics.reduce((acc, topic) => {
        acc[topic] = (acc[topic] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      // Step 4: Generate insights from the data
      logger.info('Generating insights from the collected data');
      
      const insightPrompt = `
        Analyze these ${articles.length} news articles about ${topic}:
        ${JSON.stringify(articles, null, 2)}
        
        Source distribution: ${JSON.stringify(sourceDistribution, null, 2)}
        Topic frequency: ${JSON.stringify(topicFrequency, null, 2)}
        
        Based on this data, provide:
        1. A summary of the current trends in ${topic}
        2. Key companies or technologies mentioned
        3. Potential implications or future developments
        4. Any notable patterns or insights from the articles
        
        Format your analysis as markdown with clear headings and bullet points.
      `;
      
      const insights = await browserAgent.navigate(insightPrompt);
      
      // Step 5: Generate output
      
      // Create output directory if it doesn't exist
      const outputDir = path.join(__dirname, 'output');
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
      }
      
      // Save the raw data as JSON
      const dataOutputPath = path.join(outputDir, `${topic.replace(/\s+/g, '-')}-articles.json`);
      fs.writeFileSync(dataOutputPath, JSON.stringify(articles, null, 2));
      
      // Save the insights as markdown
      const insightsOutputPath = path.join(outputDir, `${topic.replace(/\s+/g, '-')}-insights.md`);
      fs.writeFileSync(insightsOutputPath, insights);
      
      // Generate a simple HTML report
      const htmlReport = `
<!DOCTYPE html>
<html>
<head>
  <title>${topic} News Analysis</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 1000px; margin: 0 auto; padding: 20px; }
    h1, h2, h3 { color: #333; }
    .article { border: 1px solid #ddd; padding: 15px; margin-bottom: 15px; border-radius: 5px; }
    .source { color: #666; font-size: 0.9em; }
    .date { color: #666; font-size: 0.9em; }
    .topics { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 10px; }
    .topic { background: #f0f0f0; padding: 3px 8px; border-radius: 12px; font-size: 0.8em; }
    .insights { background: #f9f9f9; padding: 20px; border-radius: 5px; margin-top: 30px; }
  </style>
</head>
<body>
  <h1>${topic} News Analysis</h1>
  <p>Analysis generated on ${new Date().toLocaleDateString()} with R6D9 Agent Node</p>
  
  <h2>Collected Articles (${articles.length})</h2>
  <div class="articles">
    ${articles.map(article => `
      <div class="article">
        <h3><a href="${article.url}" target="_blank">${article.title}</a></h3>
        <p class="source">Source: ${article.source}</p>
        <p class="date">Published: ${article.date}</p>
        <p>${article.summary}</p>
        <div class="topics">
          ${article.topics.map(topic => `<span class="topic">${topic}</span>`).join('')}
        </div>
      </div>
    `).join('')}
  </div>
  
  <div class="insights">
    ${insights.replace(/^#/gm, '##').replace(/```markdown|```/g, '')}
  </div>
</body>
</html>
      `;
      
      const htmlOutputPath = path.join(outputDir, `${topic.replace(/\s+/g, '-')}-report.html`);
      fs.writeFileSync(htmlOutputPath, htmlReport);
      
      console.log('\n===== DATA COLLECTION COMPLETE =====');
      console.log(`Collected ${articles.length} articles about "${topic}" from ${Object.keys(sourceDistribution).length} sources`);
      console.log('\nOutputs saved to:');
      console.log(`- Data: ${dataOutputPath}`);
      console.log(`- Insights: ${insightsOutputPath}`);
      console.log(`- HTML Report: ${htmlOutputPath}`);
      
      console.log('\n===== KEY INSIGHTS =====');
      console.log(insights.slice(0, 500) + '...');
    }
    
  } catch (error) {
    logger.error('Error in data scraping example', { 
      error: error.message,
      stack: error.stack
    });
  } finally {
    // Clean up
    await browserAgent.close();
    logger.info('Browser closed, data scraping example completed');
  }
}

// Run the example
runDataScrapingExample();

/**
 * To run this example:
 * 1. Make sure you have set up your .env file with the necessary API keys
 * 2. Run the following command:
 *    npx ts-node examples/data-scraping-analysis.ts
 * 
 * The script will create an "output" directory with three files:
 * - A JSON file with the raw collected data
 * - A Markdown file with insights and analysis
 * - An HTML report combining both the data and insights
 */
