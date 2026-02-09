'use client';

import { useState, useEffect, useRef } from 'react';
import { Play, Pause, X, Maximize2, Minimize2 } from 'lucide-react';

interface LiveMonitorViewProps {
  companyId: number;
  companyName: string;
  websiteUrl: string;
  onClose: () => void;
}

interface LiveEvent {
  timestamp: string;
  action: string;
  status: 'info' | 'success' | 'warning' | 'error';
  message: string;
  screenshot?: string;
}

export default function LiveMonitorView({ 
  companyId, 
  companyName, 
  websiteUrl,
  onClose 
}: LiveMonitorViewProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [lastEventId, setLastEventId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<string>(websiteUrl);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  // SSE connection for real-time updates
  useEffect(() => {
    if (!isPlaying) return;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    // Use last_id query param for manual resumption if needed
    const sseUrl = `${apiUrl}/sse/campaign/${companyId}${lastEventId ? `?last_id=${lastEventId}` : ''}`;
    const eventSource = new EventSource(sseUrl);
    
    eventSource.onopen = () => {
      console.log('SSE connected for live monitoring');
      if (!lastEventId) {
        addEvent('Connected to live monitoring', 'success', 'SSE connected');
      }
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Skip generic connection messages
        if (data.type === 'connected') {
          return;
        }
        
        // Track the ID from the SSE event for resumption
        if (event.lastEventId) {
          setLastEventId(event.lastEventId);
        }

        handleSSEMessage(data);
      } catch (error) {
        console.error('Error parsing SSE message:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE error:', error);
      // EventSource will auto-reconnect using Last-Event-ID header automatically
    };

    eventSourceRef.current = eventSource;

    return () => {
      eventSource.close();
    };
  }, [isPlaying, companyId]); // lastEventId is NOT in deps to avoid loop on every message

  const handleSSEMessage = (data: any) => {
    const { action, status, message, url, screenshot } = data;

    // Update iframe URL if page changed
    if (url && url !== currentPage) {
      setCurrentPage(url);
    }

    // Add event to log
    addEvent(action, status, message, screenshot);
  };

  const addEvent = (
    action: string, 
    status: 'info' | 'success' | 'warning' | 'error', 
    message: string,
    screenshot?: string
  ) => {
    setEvents(prev => [
      {
        timestamp: new Date().toLocaleTimeString(),
        action,
        status,
        message,
        screenshot
      },
      ...prev
    ].slice(0, 50)); // Keep last 50 events
  };

  const startProcessing = async () => {
    setIsPlaying(true);
    addEvent('Starting automation', 'info', `Processing ${companyName}...`);
    
    try {
      // Trigger backend to start processing this company
      const response = await fetch(`/api/campaigns/companies/${companyId}/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error('Failed to start processing');
      }
    } catch (error) {
      console.error('Error starting processing:', error);
      addEvent('Failed to start', 'error', 'Could not start automation');
      setIsPlaying(false);
    }
  };

  const stopProcessing = () => {
    setIsPlaying(false);
    eventSourceRef.current?.close();
    addEvent('Stopped automation', 'warning', 'Processing stopped by user');
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-400';
      case 'error': return 'text-red-400';
      case 'warning': return 'text-yellow-400';
      default: return 'text-blue-400';
    }
  };

  return (
    <div className={`fixed bg-[#0A0A0A] border border-gray-800 rounded-lg shadow-2xl transition-all z-50 ${
      isFullscreen 
        ? 'inset-4' 
        : 'bottom-4 right-4 w-[800px] h-[600px]'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 bg-[#0F0F0F]">
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-green-500 animate-pulse' : 'bg-gray-600'}`} />
          <div>
            <h3 className="text-sm font-semibold text-white">{companyName}</h3>
            <p className="text-xs text-gray-400">{websiteUrl}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {!isPlaying ? (
            <button
              onClick={startProcessing}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              title="Start Processing"
            >
              <Play className="w-4 h-4 text-green-500" />
            </button>
          ) : (
            <button
              onClick={stopProcessing}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              title="Stop Processing"
            >
              <Pause className="w-4 h-4 text-yellow-500" />
            </button>
          )}
          
          <button
            onClick={toggleFullscreen}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4 text-gray-400" />
            ) : (
              <Maximize2 className="w-4 h-4 text-gray-400" />
            )}
          </button>
          
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            title="Close"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex h-[calc(100%-60px)]">
        {/* Live Browser View */}
        <div className="flex-1 bg-white">
          <iframe
            ref={iframeRef}
            src={currentPage}
            className="w-full h-full"
            sandbox="allow-same-origin allow-scripts allow-forms"
            title="Live Website View"
          />
        </div>

        {/* Event Log */}
        <div className="w-80 border-l border-gray-800 bg-[#0F0F0F] flex flex-col">
          <div className="px-4 py-3 border-b border-gray-800">
            <h4 className="text-sm font-semibold text-white">Activity Log</h4>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {events.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">
                No events yet. Click play to start.
              </p>
            ) : (
              events.map((event, index) => (
                <div 
                  key={index}
                  className="text-xs bg-[#1A1A1A] rounded-lg p-3 border border-gray-800"
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className={`font-semibold ${getStatusColor(event.status)}`}>
                      {event.action}
                    </span>
                    <span className="text-gray-500 text-[10px]">
                      {event.timestamp}
                    </span>
                  </div>
                  <p className="text-gray-400">{event.message}</p>
                  
                  {event.screenshot && (
                    <img 
                      src={event.screenshot} 
                      alt="Screenshot"
                      className="mt-2 rounded border border-gray-700 w-full"
                    />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
