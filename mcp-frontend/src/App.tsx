import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'
import PomVisualizer from './components/PomVisualizer'

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

interface POMFile {
  name: string;
  path: string;
  content: string;
}

function App() {
  const [url, setUrl] = useState('')
  const [status, setStatus] = useState('Ready')
  const [results, setResults] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [crawlResults, setCrawlResults] = useState<CrawlResult | null>(null)
  const [isCrawling, setIsCrawling] = useState(false)
  const [pomFiles, setPomFiles] = useState<POMFile[]>([])
  const [selectedFile, setSelectedFile] = useState<POMFile | null>(null)

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

  useEffect(() => {
    const fetchPOMFiles = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/pom-files')
        if (!response.ok) {
          throw new Error('Failed to fetch POM files')
        }
        const data = await response.json()
        setPomFiles(data)
      } catch (err) {
        setError('Error fetching POM files. Please make sure the server is running.')
        console.error('Error:', err)
      }
    }

    fetchPOMFiles()
  }, [])

  const handleFileSelect = async (file: POMFile) => {
    try {
      const response = await fetch(`http://localhost:3000/api/pom-files/${encodeURIComponent(file.path)}`)
      if (!response.ok) {
        throw new Error('Failed to fetch file content')
      }
      const data = await response.json()
      setSelectedFile({ ...file, content: data.content })
    } catch (err) {
      setError('Error fetching file content')
      console.error('Error:', err)
    }
  }

  return (
    <div className="min-h-screen bg-atenea-dark-bg text-atenea-dark-text font-sans flex flex-col items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-4xl space-y-6 bg-atenea-dark-card rounded-lg shadow-xl p-6 sm:p-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-center items-center text-center sm:text-left mb-6">
          <img
            src="/atenea-logo.png"
            alt="Atenea Conocimientos Logo"
            className="h-12 w-auto mb-3 sm:mb-0 sm:mr-4"
          />
        </div>
        <div className="flex flex-col sm:flex-row justify-center items-center text-center sm:text-left mb-6">
          <h1 className="text-3xl font-bold text-atenea-violet">
            Aegis QA Toolkit
          </h1>
        </div>

        {/* Input Section */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="url" className="block text-lg font-medium text-white">
              Target URL
            </label>
            <input
              id="url"
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter target URL"
              className="w-full p-3 rounded-lg bg-gray-900 border-2 border-gray-700 focus:border-atenea-violet focus:ring-2 focus:ring-atenea-violet/50 text-white placeholder-gray-400 text-lg"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            <button 
              onClick={handleAnalyzeSinglePage}
              className="flex-1 bg-atenea-violet hover:bg-atenea-violet/80 text-white font-bold py-3 px-6 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-atenea-violet/20 text-lg"
              disabled={!url}
            >
              Analyze Single Page
            </button>
            
            <button 
              onClick={handleStartCrawl}
              className="flex-1 bg-atenea-cyan hover:bg-atenea-cyan/80 text-gray-900 font-bold py-3 px-6 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-atenea-cyan/20 text-lg"
              disabled={!url || isCrawling}
            >
              {isCrawling ? 'Crawling...' : 'Start Crawl & Generate POMs'}
            </button>
          </div>
        </div>

        {/* Status Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-white mb-4">Status</h2>
          <div className={`p-4 rounded-lg font-mono text-base overflow-auto whitespace-pre-wrap min-h-[100px] border ${
            error 
              ? 'bg-red-900/30 text-red-200 border-red-800' 
              : 'bg-gray-900/50 text-gray-200 border-gray-700'
          }`}>
            <p className="font-medium">
              {status}
              {error && (
                <div className="mt-2 text-red-300 font-normal">
                  Error: {error}
                </div>
              )}
            </p>
          </div>
        </div>

        {/* Results Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-white mb-4">Results</h2>
          <div className="space-y-4">
            {results ? (
              <div className="space-y-3 text-lg">
                <div className="flex justify-between items-center p-3 bg-gray-900/50 rounded-lg">
                  <span className="text-gray-300">Status:</span>
                  <span className={results.success ? 'text-atenea-green font-medium' : 'text-red-400 font-medium'}>
                    {results.success ? 'Success' : 'Failed'}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-900/50 rounded-lg">
                  <span className="text-gray-300">Message:</span>
                  <span className="text-white">{results.message}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-900/50 rounded-lg">
                  <span className="text-gray-300">Page Name:</span>
                  <span className="text-white">{results.pageName}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-900/50 rounded-lg">
                  <span className="text-gray-300">Elements Found:</span>
                  <span className="text-atenea-cyan font-medium">{results.elementsCount}</span>
                </div>
              </div>
            ) : crawlResults ? (
              <div className="space-y-6">
                <div className="space-y-3 text-lg">
                  <div className="flex justify-between items-center p-3 bg-gray-900/50 rounded-lg">
                    <span className="text-gray-300">Status:</span>
                    <span className={crawlResults.success ? 'text-atenea-green font-medium' : 'text-red-400 font-medium'}>
                      {crawlResults.success ? 'Success' : 'Failed'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-900/50 rounded-lg">
                    <span className="text-gray-300">Message:</span>
                    <span className="text-white">{crawlResults.message}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-900/50 rounded-lg">
                    <span className="text-gray-300">Pages Analyzed:</span>
                    <span className="text-atenea-cyan font-medium">{crawlResults.pagesAnalyzed.length}</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-medium text-white mb-3">Pages List</h3>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                    {crawlResults.pagesAnalyzed.map((page, index) => (
                      <div 
                        key={index} 
                        className="p-3 bg-gray-900/50 rounded-lg text-base text-gray-300 hover:bg-gray-900 transition-colors"
                      >
                        {page}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-400 text-lg">No results yet</p>
            )}
          </div>
        </div>

        {/* POM Visualizer Section */}
        <PomVisualizer />
      </div>

      <footer className="text-center text-sm text-gray-500 p-4 mt-8">
        Powered by{' '}
        <a
          href="https://www.linkedin.com/in/juan-qa/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-atenea-cyan hover:underline"
        >
          Atenea Conocimientos
        </a>
      </footer>
    </div>
  )
}

export default App
