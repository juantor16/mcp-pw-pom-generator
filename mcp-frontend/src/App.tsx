import { useState } from 'react'
import axios from 'axios'
import './App.css'

interface AnalysisResult {
  success: boolean;
  message: string;
  pageName: string;
  elementsCount: number;
}

interface CrawlResult {
  success: boolean;
  message: string;
  pagesAnalyzed: string[];
}

function App() {
  const [url, setUrl] = useState('')
  const [status, setStatus] = useState('Ready')
  const [results, setResults] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [crawlResults, setCrawlResults] = useState<CrawlResult | null>(null)
  const [isCrawling, setIsCrawling] = useState(false)

  const handleAnalyzeSinglePage = async () => {
    // Reset previous results and errors
    setResults(null)
    setError(null)
    setCrawlResults(null)
    setStatus('Analyzing page...')

    try {
      const response = await axios.post<AnalysisResult>('http://localhost:3001/analyze', {
        url: url
      })

      setStatus('Analysis complete!')
      setResults(response.data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred'
      setStatus('Error during analysis')
      setError(errorMessage)
      console.error('Analysis error:', err)
    }
  }

  const handleStartCrawl = async () => {
    // Reset previous results and errors
    setResults(null)
    setError(null)
    setCrawlResults(null)
    setStatus('Starting crawl...')
    setIsCrawling(true)

    try {
      const response = await axios.post<CrawlResult>('http://localhost:3001/crawl', {
        url: url
      })

      setStatus('Crawl finished!')
      setCrawlResults(response.data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred'
      setStatus('Error during crawl')
      setError(errorMessage)
      console.error('Crawl error:', err)
    } finally {
      setIsCrawling(false)
    }
  }

  return (
    <div className="app-container">
      <h1>MCP POM Generator GUI</h1>
      
      <div className="input-section">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter target URL"
          className="url-input"
        />
      </div>

      <div className="button-section">
        <button 
          onClick={handleAnalyzeSinglePage}
          className="action-button"
          disabled={!url}
        >
          Analyze Single Page
        </button>
        
        <button 
          onClick={handleStartCrawl}
          className="action-button"
          disabled={!url || isCrawling}
        >
          {isCrawling ? 'Crawling...' : 'Start Crawl & Generate POMs'}
        </button>
      </div>

      <div className="status-section">
        <h2>Status</h2>
        <pre className={`status-message ${error ? 'error' : ''}`}>
          {status}
          {error && (
            <div className="error-message">
              Error: {error}
            </div>
          )}
        </pre>
      </div>

      <div className="results-section">
        <h2>Results</h2>
        <pre className="results-content">
          {results ? (
            <>
              <div className="result-item">
                <strong>Status:</strong> {results.success ? 'Success' : 'Failed'}
              </div>
              <div className="result-item">
                <strong>Message:</strong> {results.message}
              </div>
              <div className="result-item">
                <strong>Page Name:</strong> {results.pageName}
              </div>
              <div className="result-item">
                <strong>Elements Found:</strong> {results.elementsCount}
              </div>
            </>
          ) : crawlResults ? (
            <>
              <div className="result-item">
                <strong>Status:</strong> {crawlResults.success ? 'Success' : 'Failed'}
              </div>
              <div className="result-item">
                <strong>Message:</strong> {crawlResults.message}
              </div>
              <div className="result-item">
                <strong>Pages Analyzed:</strong> {crawlResults.pagesAnalyzed.length}
              </div>
              <div className="pages-list">
                {crawlResults.pagesAnalyzed.map((page, index) => (
                  <div key={index} className="page-item">
                    {page}
                  </div>
                ))}
              </div>
            </>
          ) : (
            'No results yet'
          )}
        </pre>
      </div>
    </div>
  )
}

export default App
