import { Source } from "../types/multiStepChatTypes";

interface AssetsStepProps {
  isLoading: boolean;
  searchQuery: string;
  sources: Source[];
  toggleSource: (id: number) => void;
  toggleAllSources: () => void;
  selectedCount: number;
  handleImportBoard: () => void;
  isImporting: boolean;
  hasExistingKb?: boolean; // New prop to determine if KB already exists
}

const SkeletonLoader = ({ searchQuery }: { searchQuery: string }) => (
  <div className="p-8">
    <div className="bg-[#4596FF]/10 rounded-xl p-4 mb-6">
      <div className="flex items-start gap-2">
        <span className="text-gray-600 font-medium">Searched:</span>
        <span className="text-gray-900 font-semibold flex-1">
          {searchQuery}
        </span>
      </div>
    </div>

    <div className="animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>

      <div className="flex items-center justify-between mb-6">
        <div className="h-6 bg-gray-200 rounded w-32"></div>
        <div className="w-6 h-6 bg-gray-200 rounded"></div>
      </div>

      <div className="space-y-4 mb-8">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="flex items-start gap-4 p-4 border border-gray-200 rounded-xl"
          >
            <div className="min-w-12 min-h-12 bg-gray-200 rounded flex-shrink-0"></div>
            <div className="flex-1">
              <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-1"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
            <div className="w-6 h-6 bg-gray-200 rounded flex-shrink-0"></div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div className="h-5 bg-gray-200 rounded w-32"></div>
        <div className="h-10 bg-gray-200 rounded-full w-36"></div>
      </div>
    </div>
  </div>
);

const AssetsStep: React.FC<AssetsStepProps> = ({
  isLoading,
  searchQuery,
  sources,
  toggleSource,
  toggleAllSources,
  selectedCount,
  handleImportBoard,
  isImporting,
  hasExistingKb = false,
}) => {
  return (
    <>
      {isLoading ? (
        <SkeletonLoader searchQuery={searchQuery} />
      ) : (
        <div className="p-8 h-full flex flex-col">
          <div className="bg-[#4596FF]/10 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-2">
              <span className="text-gray-600 font-medium">Searched:</span>
              <span className="text-gray-900 font-semibold flex-1">
                {searchQuery}
              </span>
            </div>
          </div>

          <p className="text-gray-700 mb-8 leading-relaxed">
            {sources.length > 0
              ? `Found ${sources.length} relevant sources for your search. Review and select the sources you'd like to include in your research.`
              : "This selection of sources explores the fascinating connections between mythological figures and the names of geographic features across different cultures and celestial bodies."}
          </p>

          <div className="flex items-center justify-between mb-6">
            <button
              onClick={toggleAllSources}
              className="text-gray-700 font-semibold hover:text-gray-900"
            >
              Select all sources
            </button>
            <div
              className={`w-6 h-6 rounded border-2 flex items-center justify-center cursor-pointer transition-colors ${
                sources.every((s) => s.selected)
                  ? "bg-blue-600 border-blue-600"
                  : "border-gray-300 hover:border-gray-400"
              }`}
              onClick={toggleAllSources}
            >
              {sources.every((s) => s.selected) && (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M3 8L6.5 11.5L13 5"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </div>
          </div>

          <div className="space-y-4 mb-8 flex-1 overflow-y-scroll">
            {sources.map((source) => (
              <div
                key={source.id}
                className="flex items-start gap-4 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => toggleSource(source.id)}
              >
                <div className="min-w-12 min-h-12 bg-blue-100 rounded flex items-center justify-center flex-shrink-0">
                  {source.type === "pdf" ? (
                    <div className="w-8 h-8 bg-red-500 rounded flex items-center justify-center text-white text-xs font-bold">
                      PDF
                    </div>
                  ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <rect
                        x="4"
                        y="4"
                        width="16"
                        height="16"
                        rx="2"
                        stroke="#3B82F6"
                        strokeWidth="2"
                      />
                      <line
                        x1="4"
                        y1="8"
                        x2="20"
                        y2="8"
                        stroke="#3B82F6"
                        strokeWidth="2"
                      />
                      <line
                        x1="8"
                        y1="4"
                        x2="8"
                        y2="8"
                        stroke="#3B82F6"
                        strokeWidth="2"
                      />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="font-medium text-gray-900 mb-1">
                      {source.title}
                    </h3>
                    {source.url && (
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex-shrink-0 text-gray-400 hover:text-gray-600"
                      >
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          className="flex-shrink-0"
                        >
                          <path
                            d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </a>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm">{source.description}</p>
                </div>
                <div
                  className={`w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                    source.selected
                      ? "bg-blue-600 border-blue-600"
                      : "border-gray-300"
                  }`}
                >
                  {source.selected && (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M3 8L6.5 11.5L13 5"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-600">
              {selectedCount === sources.length
                ? sources.length
                : selectedCount}{" "}
              sources selected
            </span>
            <button
              onClick={handleImportBoard}
              disabled={selectedCount === 0 || isImporting}
              className="px-8 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2"
            >
              {isImporting ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  {hasExistingKb ? "Adding to Board..." : "Creating Board..."}
                </>
              ) : hasExistingKb ? (
                "Add to Board"
              ) : (
                "Import as a Board"
              )}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AssetsStep;
