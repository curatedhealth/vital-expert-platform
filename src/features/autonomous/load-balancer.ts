import { EventEmitter } from 'events';
import { autonomousCacheManager } from './redis-cache';

/**
 * Advanced Load Balancing and Horizontal Scaling for Autonomous Agents
 * Provides intelligent task distribution, health monitoring, and auto-scaling
 */

export interface NodeConfig {
  id: string;
  host: string;
  port: number;
  weight: number;
  maxConcurrentTasks: number;
  currentLoad: number;
  health: 'healthy' | 'degraded' | 'unhealthy';
  lastHealthCheck: number;
  capabilities: string[];
  region?: string;
  zone?: string;
  metadata?: Record<string, any>;
}

export interface LoadBalancerConfig {
  strategy: 'round_robin' | 'weighted_round_robin' | 'least_connections' | 'least_response_time' | 'consistent_hash';
  healthCheckInterval: number;
  healthCheckTimeout: number;
  maxRetries: number;
  retryDelay: number;
  enableAutoScaling: boolean;
  minNodes: number;
  maxNodes: number;
  scaleUpThreshold: number;
  scaleDownThreshold: number;
  scaleCooldown: number;
}

export interface TaskAssignment {
  taskId: string;
  nodeId: string;
  priority: number;
  estimatedDuration: number;
  assignedAt: number;
  status: 'pending' | 'running' | 'completed' | 'failed';
  retryCount: number;
  metadata?: Record<string, any>;
}

export interface LoadBalancerStats {
  totalNodes: number;
  healthyNodes: number;
  totalTasks: number;
  runningTasks: number;
  completedTasks: number;
  failedTasks: number;
  averageResponseTime: number;
  throughput: number;
  errorRate: number;
  lastUpdated: number;
}

/**
 * Load Balancing Strategies
 */
export abstract class LoadBalancingStrategy {
  abstract selectNode(nodes: NodeConfig[], task: any): NodeConfig | null;
  abstract updateNodeLoad(nodeId: string, load: number): void;
  abstract getNodeStats(nodeId: string): any;
}

export class RoundRobinStrategy extends LoadBalancingStrategy {
  private currentIndex: number = 0;

  selectNode(nodes: NodeConfig[], task: any): NodeConfig | null {
    const healthyNodes = nodes.filter(node => node.health === 'healthy');
    if (healthyNodes.length === 0) return null;

    const node = healthyNodes[this.currentIndex % healthyNodes.length];
    this.currentIndex++;
    return node;
  }

  updateNodeLoad(nodeId: string, load: number): void {
    // Round robin doesn't track load
  }

  getNodeStats(nodeId: string): any {
    return { strategy: 'round_robin' };
  }
}

export class WeightedRoundRobinStrategy extends LoadBalancingStrategy {
  private currentWeights: Map<string, number> = new Map();

  selectNode(nodes: NodeConfig[], task: any): NodeConfig | null {
    const healthyNodes = nodes.filter(node => node.health === 'healthy');
    if (healthyNodes.length === 0) return null;

    // Calculate total weight
    const totalWeight = healthyNodes.reduce((sum, node) => sum + node.weight, 0);
    if (totalWeight === 0) return healthyNodes[0];

    // Find node with highest current weight
    let selectedNode = healthyNodes[0];
    let maxWeight = this.currentWeights.get(selectedNode.id) || 0;

    for (const node of healthyNodes) {
      const currentWeight = this.currentWeights.get(node.id) || 0;
      const effectiveWeight = currentWeight + node.weight;
      
      if (effectiveWeight > maxWeight) {
        maxWeight = effectiveWeight;
        selectedNode = node;
      }
    }

    // Update weights
    this.currentWeights.set(selectedNode.id, maxWeight - totalWeight);
    return selectedNode;
  }

  updateNodeLoad(nodeId: string, load: number): void {
    // Weighted round robin doesn't track load
  }

  getNodeStats(nodeId: string): any {
    return { 
      strategy: 'weighted_round_robin',
      currentWeight: this.currentWeights.get(nodeId) || 0
    };
  }
}

export class LeastConnectionsStrategy extends LoadBalancingStrategy {
  private nodeConnections: Map<string, number> = new Map();

  selectNode(nodes: NodeConfig[], task: any): NodeConfig | null {
    const healthyNodes = nodes.filter(node => node.health === 'healthy');
    if (healthyNodes.length === 0) return null;

    // Find node with least connections
    let selectedNode = healthyNodes[0];
    let minConnections = this.nodeConnections.get(selectedNode.id) || 0;

    for (const node of healthyNodes) {
      const connections = this.nodeConnections.get(node.id) || 0;
      if (connections < minConnections) {
        minConnections = connections;
        selectedNode = node;
      }
    }

    return selectedNode;
  }

  updateNodeLoad(nodeId: string, load: number): void {
    this.nodeConnections.set(nodeId, load);
  }

  getNodeStats(nodeId: string): any {
    return { 
      strategy: 'least_connections',
      connections: this.nodeConnections.get(nodeId) || 0
    };
  }
}

export class LeastResponseTimeStrategy extends LoadBalancingStrategy {
  private nodeResponseTimes: Map<string, number[]> = new Map();
  private maxSamples: number = 10;

  selectNode(nodes: NodeConfig[], task: any): NodeConfig | null {
    const healthyNodes = nodes.filter(node => node.health === 'healthy');
    if (healthyNodes.length === 0) return null;

    // Find node with least average response time
    let selectedNode = healthyNodes[0];
    let minResponseTime = this.getAverageResponseTime(selectedNode.id);

    for (const node of healthyNodes) {
      const responseTime = this.getAverageResponseTime(node.id);
      if (responseTime < minResponseTime) {
        minResponseTime = responseTime;
        selectedNode = node;
      }
    }

    return selectedNode;
  }

  updateNodeLoad(nodeId: string, load: number): void {
    // Least response time doesn't track load directly
  }

  recordResponseTime(nodeId: string, responseTime: number): void {
    const times = this.nodeResponseTimes.get(nodeId) || [];
    times.push(responseTime);
    
    // Keep only recent samples
    if (times.length > this.maxSamples) {
      times.shift();
    }
    
    this.nodeResponseTimes.set(nodeId, times);
  }

  private getAverageResponseTime(nodeId: string): number {
    const times = this.nodeResponseTimes.get(nodeId) || [];
    if (times.length === 0) return 0;
    
    return times.reduce((sum, time) => sum + time, 0) / times.length;
  }

  getNodeStats(nodeId: string): any {
    const times = this.nodeResponseTimes.get(nodeId) || [];
    return { 
      strategy: 'least_response_time',
      averageResponseTime: this.getAverageResponseTime(nodeId),
      sampleCount: times.length
    };
  }
}

export class ConsistentHashStrategy extends LoadBalancingStrategy {
  private hashRing: Map<number, NodeConfig> = new Map();
  private virtualNodes: number = 100;

  constructor() {
    super();
  }

  updateNodes(nodes: NodeConfig[]): void {
    this.hashRing.clear();
    
    for (const node of nodes) {
      if (node.health === 'healthy') {
        // Add virtual nodes for better distribution
        for (let i = 0; i < this.virtualNodes; i++) {
          const hash = this.hash(`${node.id}:${i}`);
          this.hashRing.set(hash, node);
        }
      }
    }
  }

  selectNode(nodes: NodeConfig[], task: any): NodeConfig | null {
    this.updateNodes(nodes);
    
    if (this.hashRing.size === 0) return null;

    const taskHash = this.hash(task.id || JSON.stringify(task));
    const sortedHashes = Array.from(this.hashRing.keys()).sort((a, b) => a - b);
    
    // Find first hash greater than or equal to task hash
    for (const hash of sortedHashes) {
      if (hash >= taskHash) {
        return this.hashRing.get(hash)!;
      }
    }
    
    // Wrap around to first node
    return this.hashRing.get(sortedHashes[0])!;
  }

  updateNodeLoad(nodeId: string, load: number): void {
    // Consistent hash doesn't track load
  }

  getNodeStats(nodeId: string): any {
    return { 
      strategy: 'consistent_hash',
      virtualNodes: this.virtualNodes
    };
  }

  private hash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }
}

/**
 * Health Monitor for Nodes
 */
export class NodeHealthMonitor {
  private eventEmitter: EventEmitter;
  private healthChecks: Map<string, NodeJS.Timeout> = new Map();

  constructor(private config: LoadBalancerConfig) {
    this.eventEmitter = new EventEmitter();
  }

  /**
   * Start health monitoring for a node
   */
  startMonitoring(node: NodeConfig): void {
    const checkHealth = async () => {
      try {
        const startTime = Date.now();
        const response = await fetch(`http://${node.host}:${node.port}/health`, {
          method: 'GET',
          timeout: this.config.healthCheckTimeout
        });
        
        const responseTime = Date.now() - startTime;
        const isHealthy = response.ok && responseTime < this.config.healthCheckTimeout;
        
        this.eventEmitter.emit('node:healthCheck', {
          nodeId: node.id,
          healthy: isHealthy,
          responseTime,
          timestamp: Date.now()
        });
        
        if (!isHealthy) {
          this.eventEmitter.emit('node:unhealthy', {
            nodeId: node.id,
            responseTime,
            timestamp: Date.now()
          });
        }
      } catch (error) {
        this.eventEmitter.emit('node:healthCheckError', {
          nodeId: node.id,
          error: error.message,
          timestamp: Date.now()
        });
      }
    };

    // Initial health check
    checkHealth();
    
    // Schedule periodic health checks
    const interval = setInterval(checkHealth, this.config.healthCheckInterval);
    this.healthChecks.set(node.id, interval);
  }

  /**
   * Stop health monitoring for a node
   */
  stopMonitoring(nodeId: string): void {
    const interval = this.healthChecks.get(nodeId);
    if (interval) {
      clearInterval(interval);
      this.healthChecks.delete(nodeId);
    }
  }

  /**
   * Stop all health monitoring
   */
  stopAllMonitoring(): void {
    for (const interval of this.healthChecks.values()) {
      clearInterval(interval);
    }
    this.healthChecks.clear();
  }

  /**
   * Add event listener
   */
  on(event: string, listener: (...args: any[]) => void): void {
    this.eventEmitter.on(event, listener);
  }

  /**
   * Remove event listener
   */
  off(event: string, listener: (...args: any[]) => void): void {
    this.eventEmitter.off(event, listener);
  }
}

/**
 * Auto Scaler for Dynamic Node Management
 */
export class AutoScaler {
  private eventEmitter: EventEmitter;
  private lastScaleTime: number = 0;

  constructor(
    private config: LoadBalancerConfig,
    private loadBalancer: LoadBalancer
  ) {
    this.eventEmitter = new EventEmitter();
  }

  /**
   * Check if scaling is needed
   */
  async checkScaling(): Promise<void> {
    if (!this.config.enableAutoScaling) return;
    
    const now = Date.now();
    if (now - this.lastScaleTime < this.config.scaleCooldown) return;

    const stats = await this.loadBalancer.getStats();
    const healthyNodes = this.loadBalancer.getHealthyNodes();
    
    // Scale up if needed
    if (healthyNodes.length < this.config.maxNodes && this.shouldScaleUp(stats)) {
      await this.scaleUp();
      this.lastScaleTime = now;
    }
    
    // Scale down if needed
    if (healthyNodes.length > this.config.minNodes && this.shouldScaleDown(stats)) {
      await this.scaleDown();
      this.lastScaleTime = now;
    }
  }

  /**
   * Check if should scale up
   */
  private shouldScaleUp(stats: LoadBalancerStats): boolean {
    return (
      stats.averageResponseTime > this.config.scaleUpThreshold ||
      stats.errorRate > 0.1 ||
      stats.healthyNodes < this.config.minNodes
    );
  }

  /**
   * Check if should scale down
   */
  private shouldScaleDown(stats: LoadBalancerStats): boolean {
    return (
      stats.averageResponseTime < this.config.scaleDownThreshold &&
      stats.errorRate < 0.05 &&
      stats.healthyNodes > this.config.minNodes
    );
  }

  /**
   * Scale up by adding a new node
   */
  private async scaleUp(): Promise<void> {
    this.eventEmitter.emit('scaler:scaleUp', { timestamp: Date.now() });
    
    // In a real implementation, this would:
    // 1. Provision a new node (Kubernetes, Docker, etc.)
    // 2. Wait for node to be ready
    // 3. Add node to load balancer
    // 4. Start health monitoring
    
    console.log('🔄 [AutoScaler] Scaling up - adding new node');
  }

  /**
   * Scale down by removing a node
   */
  private async scaleDown(): Promise<void> {
    this.eventEmitter.emit('scaler:scaleDown', { timestamp: Date.now() });
    
    // In a real implementation, this would:
    // 1. Select least loaded node
    // 2. Drain tasks from node
    // 3. Remove node from load balancer
    // 4. Stop health monitoring
    // 5. Terminate node
    
    console.log('🔄 [AutoScaler] Scaling down - removing node');
  }

  /**
   * Add event listener
   */
  on(event: string, listener: (...args: any[]) => void): void {
    this.eventEmitter.on(event, listener);
  }

  /**
   * Remove event listener
   */
  off(event: string, listener: (...args: any[]) => void): void {
    this.eventEmitter.off(event, listener);
  }
}

/**
 * Main Load Balancer
 */
export class LoadBalancer {
  private nodes: Map<string, NodeConfig> = new Map();
  private strategy: LoadBalancingStrategy;
  private healthMonitor: NodeHealthMonitor;
  private autoScaler: AutoScaler;
  private taskAssignments: Map<string, TaskAssignment> = new Map();
  private eventEmitter: EventEmitter;
  private stats: LoadBalancerStats;

  constructor(config: Partial<LoadBalancerConfig> = {}) {
    const fullConfig: LoadBalancerConfig = {
      strategy: 'weighted_round_robin',
      healthCheckInterval: 30000,
      healthCheckTimeout: 5000,
      maxRetries: 3,
      retryDelay: 1000,
      enableAutoScaling: true,
      minNodes: 2,
      maxNodes: 10,
      scaleUpThreshold: 2000, // 2 seconds
      scaleDownThreshold: 500, // 500ms
      scaleCooldown: 300000, // 5 minutes
      ...config
    };

    this.strategy = this.createStrategy(fullConfig.strategy);
    this.healthMonitor = new NodeHealthMonitor(fullConfig);
    this.autoScaler = new AutoScaler(fullConfig, this);
    this.eventEmitter = new EventEmitter();
    
    this.stats = {
      totalNodes: 0,
      healthyNodes: 0,
      totalTasks: 0,
      runningTasks: 0,
      completedTasks: 0,
      failedTasks: 0,
      averageResponseTime: 0,
      throughput: 0,
      errorRate: 0,
      lastUpdated: Date.now()
    };

    this.setupEventHandlers();
    this.startStatsUpdater();
  }

  /**
   * Create load balancing strategy
   */
  private createStrategy(strategy: string): LoadBalancingStrategy {
    switch (strategy) {
      case 'round_robin':
        return new RoundRobinStrategy();
      case 'weighted_round_robin':
        return new WeightedRoundRobinStrategy();
      case 'least_connections':
        return new LeastConnectionsStrategy();
      case 'least_response_time':
        return new LeastResponseTimeStrategy();
      case 'consistent_hash':
        return new ConsistentHashStrategy();
      default:
        return new WeightedRoundRobinStrategy();
    }
  }

  /**
   * Add a node to the load balancer
   */
  addNode(node: NodeConfig): void {
    this.nodes.set(node.id, node);
    this.healthMonitor.startMonitoring(node);
    this.updateStats();
    
    this.eventEmitter.emit('node:added', { nodeId: node.id, node });
    console.log(`✅ [LoadBalancer] Added node: ${node.id} (${node.host}:${node.port})`);
  }

  /**
   * Remove a node from the load balancer
   */
  removeNode(nodeId: string): void {
    const node = this.nodes.get(nodeId);
    if (node) {
      this.healthMonitor.stopMonitoring(nodeId);
      this.nodes.delete(nodeId);
      this.updateStats();
      
      this.eventEmitter.emit('node:removed', { nodeId });
      console.log(`❌ [LoadBalancer] Removed node: ${nodeId}`);
    }
  }

  /**
   * Update node configuration
   */
  updateNode(nodeId: string, updates: Partial<NodeConfig>): void {
    const node = this.nodes.get(nodeId);
    if (node) {
      Object.assign(node, updates);
      this.updateStats();
      
      this.eventEmitter.emit('node:updated', { nodeId, updates });
    }
  }

  /**
   * Assign a task to a node
   */
  async assignTask(task: any): Promise<TaskAssignment | null> {
    const nodes = Array.from(this.nodes.values());
    const selectedNode = this.strategy.selectNode(nodes, task);
    
    if (!selectedNode) {
      this.eventEmitter.emit('task:assignmentFailed', { taskId: task.id, reason: 'No healthy nodes available' });
      return null;
    }

    const assignment: TaskAssignment = {
      taskId: task.id,
      nodeId: selectedNode.id,
      priority: task.priority || 5,
      estimatedDuration: task.estimatedDuration || 5000,
      assignedAt: Date.now(),
      status: 'pending',
      retryCount: 0,
      metadata: task.metadata
    };

    this.taskAssignments.set(task.id, assignment);
    this.updateNodeLoad(selectedNode.id, selectedNode.currentLoad + 1);
    this.updateStats();
    
    this.eventEmitter.emit('task:assigned', { assignment, nodeId: selectedNode.id });
    
    // Execute task on selected node
    this.executeTaskOnNode(assignment, selectedNode);
    
    return assignment;
  }

  /**
   * Execute task on a specific node
   */
  private async executeTaskOnNode(assignment: TaskAssignment, node: NodeConfig): Promise<void> {
    try {
      assignment.status = 'running';
      this.eventEmitter.emit('task:started', { assignment });
      
      const startTime = Date.now();
      
      // In a real implementation, this would send the task to the node
      const response = await fetch(`http://${node.host}:${node.port}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assignment)
      });
      
      const responseTime = Date.now() - startTime;
      
      if (response.ok) {
        assignment.status = 'completed';
        this.stats.completedTasks++;
        this.eventEmitter.emit('task:completed', { assignment, responseTime });
      } else {
        assignment.status = 'failed';
        this.stats.failedTasks++;
        this.eventEmitter.emit('task:failed', { assignment, error: response.statusText });
      }
      
      // Update node response time
      if (this.strategy instanceof LeastResponseTimeStrategy) {
        this.strategy.recordResponseTime(node.id, responseTime);
      }
      
      // Update node load
      this.updateNodeLoad(node.id, Math.max(0, node.currentLoad - 1));
      this.updateStats();
      
    } catch (error) {
      assignment.status = 'failed';
      this.stats.failedTasks++;
      this.updateNodeLoad(node.id, Math.max(0, node.currentLoad - 1));
      this.updateStats();
      
      this.eventEmitter.emit('task:failed', { assignment, error: error.message });
    }
  }

  /**
   * Update node load
   */
  private updateNodeLoad(nodeId: string, load: number): void {
    const node = this.nodes.get(nodeId);
    if (node) {
      node.currentLoad = load;
      this.strategy.updateNodeLoad(nodeId, load);
    }
  }

  /**
   * Get healthy nodes
   */
  getHealthyNodes(): NodeConfig[] {
    return Array.from(this.nodes.values()).filter(node => node.health === 'healthy');
  }

  /**
   * Get load balancer statistics
   */
  async getStats(): Promise<LoadBalancerStats> {
    this.updateStats();
    return { ...this.stats };
  }

  /**
   * Update statistics
   */
  private updateStats(): void {
    const nodes = Array.from(this.nodes.values());
    const healthyNodes = nodes.filter(node => node.health === 'healthy');
    const assignments = Array.from(this.taskAssignments.values());
    
    this.stats.totalNodes = nodes.length;
    this.stats.healthyNodes = healthyNodes.length;
    this.stats.totalTasks = assignments.length;
    this.stats.runningTasks = assignments.filter(a => a.status === 'running').length;
    this.stats.completedTasks = assignments.filter(a => a.status === 'completed').length;
    this.stats.failedTasks = assignments.filter(a => a.status === 'failed').length;
    this.stats.errorRate = this.stats.totalTasks > 0 ? this.stats.failedTasks / this.stats.totalTasks : 0;
    this.stats.lastUpdated = Date.now();
  }

  /**
   * Start statistics updater
   */
  private startStatsUpdater(): void {
    setInterval(() => {
      this.updateStats();
      this.autoScaler.checkScaling();
    }, 30000); // Update every 30 seconds
  }

  /**
   * Setup event handlers
   */
  private setupEventHandlers(): void {
    this.healthMonitor.on('node:unhealthy', (data) => {
      const node = this.nodes.get(data.nodeId);
      if (node) {
        node.health = 'unhealthy';
        this.updateStats();
      }
    });
  }

  /**
   * Add event listener
   */
  on(event: string, listener: (...args: any[]) => void): void {
    this.eventEmitter.on(event, listener);
  }

  /**
   * Remove event listener
   */
  off(event: string, listener: (...args: any[]) => void): void {
    this.eventEmitter.off(event, listener);
  }

  /**
   * Shutdown load balancer
   */
  async shutdown(): Promise<void> {
    this.healthMonitor.stopAllMonitoring();
    this.eventEmitter.removeAllListeners();
    console.log('🔄 [LoadBalancer] Shutdown complete');
  }
}

// Export singleton instance
export const loadBalancer = new LoadBalancer();

// Export default configuration
export const DEFAULT_LOAD_BALANCER_CONFIG: LoadBalancerConfig = {
  strategy: 'weighted_round_robin',
  healthCheckInterval: 30000,
  healthCheckTimeout: 5000,
  maxRetries: 3,
  retryDelay: 1000,
  enableAutoScaling: true,
  minNodes: 2,
  maxNodes: 10,
  scaleUpThreshold: 2000,
  scaleDownThreshold: 500,
  scaleCooldown: 300000
};
