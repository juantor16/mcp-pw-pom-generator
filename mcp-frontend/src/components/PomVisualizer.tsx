import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface PomInfo {
    pageName: string;
    pomPath: string;
    screenshotPath: string | null;
}

function PomVisualizer() {
    const [availablePoms, setAvailablePoms] = useState<PomInfo[]>([]);
    const [selectedPom, setSelectedPom] = useState<PomInfo | null>(null);
    const [pomCode, setPomCode] = useState<string>('');
    const [screenshotUrl, setScreenshotUrl] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);

    // Effect to fetch available POMs on mount
    useEffect(() => {
        const fetchPoms = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await axios.get<PomInfo[]>('http://localhost:3001/api/poms');
                setAvailablePoms(response.data);
                setHasAttemptedFetch(true);
            } catch (err) {
                const msg = err instanceof Error ? err.message : 'Failed to load POM list';
                setError(msg);
                console.error('Error fetching POM list:', err);
                setHasAttemptedFetch(true);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPoms();
    }, []);

    // Effect to fetch code/screenshot when selectedPom changes
    useEffect(() => {
        if (!selectedPom) {
            setPomCode('');
            setScreenshotUrl('');
            return;
        }

        const fetchDetails = async () => {
            setIsLoading(true);
            setError(null);
            
            // Fetch POM Code
            try {
                const codeResponse = await axios.get<{ content: string }>('http://localhost:3001/api/pom-content', {
                    params: { path: selectedPom.pomPath }
                });
                setPomCode(codeResponse.data.content);
            } catch (err) {
                const msg = err instanceof Error ? err.message : 'Failed to load POM code';
                setError(`Error loading code: ${msg}`);
                console.error('Error fetching POM code:', err);
                setPomCode('');
            }

            // Set Screenshot URL
            if (selectedPom.screenshotPath) {
                // Use the full URL to the server's static files
                const url = `http://localhost:3001/generated-output/${selectedPom.pageName}/${selectedPom.pageName}.png`;
                setScreenshotUrl(url);
            } else {
                setScreenshotUrl('');
            }

            setIsLoading(false);
        };

        fetchDetails();
    }, [selectedPom]);

    const handlePomSelection = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedPath = event.target.value;
        const pom = availablePoms.find(p => p.pomPath === selectedPath) || null;
        setSelectedPom(pom);
        setPomCode('');
        setScreenshotUrl('');
        setError(null);
    };

    return (
        <div className="my-8 p-6 bg-atenea-dark-card rounded-lg shadow-xl border border-atenea-dark-border">
            <h2 className="text-2xl font-semibold text-white mb-4">POM Visualizer</h2>

            {/* POM Selector Dropdown */}
            <div className="mb-6">
                <label htmlFor="pomSelector" className="block text-lg font-medium text-white mb-2">
                    Select Generated POM:
                </label>
                <select
                    id="pomSelector"
                    value={selectedPom?.pomPath || ''}
                    onChange={handlePomSelection}
                    className="w-full p-3 rounded-lg bg-gray-900 border-2 border-gray-700 focus:border-atenea-violet focus:ring-2 focus:ring-atenea-violet/50 text-white placeholder-gray-400 text-lg"
                >
                    <option value="" disabled>-- Select a POM --</option>
                    {availablePoms.map((pom) => (
                        <option key={pom.pomPath} value={pom.pomPath}>
                            {pom.pageName} ({pom.pomPath.replace('src/output/', '')})
                        </option>
                    ))}
                </select>
            </div>

            {/* Loading/Error States */}
            {isLoading && !selectedPom && <p className="text-atenea-cyan">Loading POM list...</p>}
            {error && !isLoading && hasAttemptedFetch && !selectedPom && <p className="text-red-400">Error loading POMs: {error}</p>}
            {isLoading && selectedPom && <p className="text-atenea-cyan mt-4">Loading details for {selectedPom.pageName}...</p>}
            {error && !isLoading && selectedPom && <p className="text-red-400 mt-4">{error}</p>}

            {/* Side-by-Side Display Area */}
            <div className="flex flex-col md:flex-row gap-6">
                {/* Code Display Area */}
                <div className="w-full md:w-1/2 border border-atenea-dark-border rounded-lg overflow-hidden">
                    <h3 className="text-xl font-medium text-white p-3 bg-gray-900/50 border-b border-atenea-dark-border">
                        Code: {selectedPom?.pomPath || ''}
                    </h3>
                    <pre className="p-4 text-sm font-mono overflow-auto max-h-[600px] bg-black text-atenea-light-gray">
                        {pomCode || 'Select a POM to view its code...'}
                    </pre>
                </div>

                {/* Screenshot Display Area */}
                <div className="w-full md:w-1/2 border border-atenea-dark-border rounded-lg overflow-hidden">
                    <h3 className="text-xl font-medium text-white p-3 bg-gray-900/50 border-b border-atenea-dark-border">
                        Screenshot: {selectedPom?.screenshotPath || 'N/A'}
                    </h3>
                    <div className="p-4 flex items-center justify-center bg-black min-h-[400px]">
                        {screenshotUrl ? (
                            <img 
                                src={screenshotUrl} 
                                alt={`Screenshot for ${selectedPom?.pageName}`} 
                                className="max-w-full max-h-[550px] object-contain"
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    target.parentElement!.querySelector('.screenshot-error')?.classList.remove('hidden');
                                }}
                            />
                        ) : (
                            <p className="text-gray-500">No screenshot available or POM not selected.</p>
                        )}
                        <p className="text-gray-500 hidden screenshot-error">Screenshot not available</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PomVisualizer; 