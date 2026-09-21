"use client";

import { useEffect, useState } from "react";

interface SoftwareTool {
  id: string;
  softwareName: string;
  reason: string;
  estimatedCost: number;
  status: string;
  updatedAt: string;
  department?: {
    name: string;
  };
}

export default function MyToolsPage() {
  const [tools, setTools] = useState<SoftwareTool[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMyTools() {
      try {
        const res = await fetch("/api/my-tools");
        if (res.ok) {
          const data = await res.json();
          setTools(data);
        }
      } catch (error) {
        console.error("Failed to load tools", error);
      } finally {
        setLoading(false);
      }
    }

    fetchMyTools();
  }, []);

  if (loading) {
    return <div className="p-6 text-center">Loading your tools...</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">My Assigned Tools</h1>

      {tools.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow text-center text-gray-500">
          No approved tools found yet. Once your software requests are approved, they will appear here.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => (
            <div key={tool.id} className="bg-white p-5 rounded-lg shadow border border-gray-100 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{tool.softwareName}</h3>
                <p className="text-sm text-gray-500 mt-1">Department: {tool.department?.name || "General"}</p>
                <p className="text-sm text-gray-600 mt-3 bg-gray-50 p-2 rounded">
                  <span className="font-medium">Reason:</span> {tool.reason}
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                <span className="text-xs px-2.5 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                  Active / Approved
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(tool.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}