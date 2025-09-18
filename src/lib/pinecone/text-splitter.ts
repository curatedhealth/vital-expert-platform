/**
 * Text splitter for breaking documents into chunks for vector storage
 */

export interface TextChunk {
  content: string;
  metadata: {
    chunkIndex: number;
    totalChunks: number;
    startIndex: number;
    endIndex: number;
  };
}

export interface SplitterOptions {
  chunkSize: number;
  chunkOverlap: number;
  separators: string[];
  keepSeparator: boolean;
}

export class RecursiveCharacterTextSplitter {
  private chunkSize: number;
  private chunkOverlap: number;
  private separators: string[];
  private keepSeparator: boolean;

  constructor(options: Partial<SplitterOptions> = {}) {
    this.chunkSize = options.chunkSize || 1000;
    this.chunkOverlap = options.chunkOverlap || 200;
    this.separators = options.separators || ['\n\n', '\n', '.', '!', '?', ',', ' ', ''];
    this.keepSeparator = options.keepSeparator || false;
  }

  /**
   * Split text into chunks recursively using different separators
   */
  splitText(text: string): TextChunk[] {
    const chunks = this._splitTextRecursive(text, this.separators);

    // Add metadata to chunks
    return chunks.map((chunk, index) => ({
      content: chunk.trim(),
      metadata: {
        chunkIndex: index,
        totalChunks: chunks.length,
        startIndex: text.indexOf(chunk),
        endIndex: text.indexOf(chunk) + chunk.length,
      },
    }));
  }

  private _splitTextRecursive(text: string, separators: string[]): string[] {
    const finalChunks: string[] = [];

    // Base case: no separators left or text is small enough
    if (separators.length === 0 || text.length <= this.chunkSize) {
      return [text];
    }

    // Get the first separator
    const separator = separators[0];
    const newSeparators = separators.slice(1);

    // Split by the current separator
    const splits = text.split(separator);

    let currentChunk = '';
    for (const split of splits) {
      const potentialChunk = currentChunk
        ? currentChunk + (this.keepSeparator ? separator : '') + split
        : split;

      if (potentialChunk.length <= this.chunkSize) {
        currentChunk = potentialChunk;
      } else {
        // Current chunk is ready, process it
        if (currentChunk) {
          finalChunks.push(...this._mergeChunks([currentChunk], this.chunkSize));
        }

        // If the split itself is too large, recursively split it
        if (split.length > this.chunkSize) {
          finalChunks.push(...this._splitTextRecursive(split, newSeparators));
        } else {
          currentChunk = split;
        }
      }
    }

    // Add the last chunk if it exists
    if (currentChunk) {
      finalChunks.push(...this._mergeChunks([currentChunk], this.chunkSize));
    }

    return finalChunks;
  }

  private _mergeChunks(chunks: string[], chunkSize: number): string[] {
    const mergedChunks: string[] = [];
    let currentChunk = '';

    for (const chunk of chunks) {
      if (currentChunk.length + chunk.length <= chunkSize) {
        currentChunk += chunk;
      } else {
        if (currentChunk) {
          mergedChunks.push(currentChunk);
        }
        currentChunk = chunk;
      }
    }

    if (currentChunk) {
      mergedChunks.push(currentChunk);
    }

    return mergedChunks;
  }
}

/**
 * Specialized splitter for different document types
 */
export class DocumentTypeSplitter {
  static forRegulatory(): RecursiveCharacterTextSplitter {
    return new RecursiveCharacterTextSplitter({
      chunkSize: 1500,
      chunkOverlap: 300,
      separators: ['\n\n', '\n', '. ', '? ', '! ', '; ', ', ', ' '],
      keepSeparator: true,
    });
  }

  static forClinical(): RecursiveCharacterTextSplitter {
    return new RecursiveCharacterTextSplitter({
      chunkSize: 1200,
      chunkOverlap: 250,
      separators: ['\n\n', '\n', '. ', '; ', ', ', ' '],
      keepSeparator: true,
    });
  }

  static forMarketResearch(): RecursiveCharacterTextSplitter {
    return new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
      separators: ['\n\n', '\n', '. ', ', ', ' '],
      keepSeparator: false,
    });
  }

  static forInternal(): RecursiveCharacterTextSplitter {
    return new RecursiveCharacterTextSplitter({
      chunkSize: 800,
      chunkOverlap: 150,
      separators: ['\n\n', '\n', '. ', ' '],
      keepSeparator: false,
    });
  }
}

/**
 * Extract relevant snippets from text for citations
 */
export function extractRelevantSnippet(
  text: string,
  query: string,
  maxLength: number = 200
): string {
  const queryWords = query.toLowerCase().split(/\s+/);
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);

  // Score sentences based on query word overlap
  const scoredSentences = sentences.map(sentence => {
    const sentenceWords = sentence.toLowerCase().split(/\s+/);
    const score = queryWords.reduce((acc, word) => {
      return acc + (sentenceWords.includes(word) ? 1 : 0);
    }, 0);

    return { sentence: sentence.trim(), score };
  });

  // Sort by score and get the best sentence
  scoredSentences.sort((a, b) => b.score - a.score);
  let bestSentence = scoredSentences[0]?.sentence || text.substring(0, maxLength);

  // Truncate if necessary
  if (bestSentence.length > maxLength) {
    bestSentence = bestSentence.substring(0, maxLength) + '...';
  }

  return bestSentence;
}