# VITAL Expert Consultation - Production Deployment Guide

This guide provides step-by-step instructions for deploying the VITAL Expert Consultation service to production.

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose installed
- API keys for OpenAI, Supabase, and Tavily
- PostgreSQL database (or use Docker)
- Redis instance (or use Docker)

### 1. Environment Setup

```bash
# Run the environment setup script
./scripts/setup-environment.sh

# This will:
# - Create .env.production file
# - Prompt for API keys
# - Generate security keys
# - Create monitoring configuration
```

### 2. Deploy Services

```bash
# Deploy all services
./scripts/deploy-expert-consultation.sh

# This will:
# - Check prerequisites
# - Run database migrations
# - Build and start services
# - Run health checks
# - Test the service
```

### 3. Test the Service

```bash
# Run comprehensive tests
./scripts/test-expert-consultation.sh

# Test specific modes
./scripts/test-expert-consultation.sh modes
./scripts/test-expert-consultation.sh interactive
./scripts/test-expert-consultation.sh autonomous
```

## 📋 Detailed Setup

### Environment Variables

The service requires the following environment variables:

#### Required API Keys
```bash
OPENAI_API_KEY=your_openai_api_key_here
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

#### Optional API Keys
```bash
TAVILY_API_KEY=your_tavily_api_key_here  # For web search
```

#### Database Configuration
```bash
DATABASE_URL=postgresql://vital:password@localhost:5432/vital_expert_consultation
REDIS_URL=redis://localhost:6379
```

#### Service Configuration
```bash
SERVICE_PORT=8001
SERVICE_HOST=0.0.0.0
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
DEFAULT_BUDGET=50.0
MAX_BUDGET=500.0
```

### Database Setup

The service uses PostgreSQL for data persistence. The migration script creates the following tables:

- `consultation_sessions` - Main session data
- `reasoning_steps` - Individual reasoning steps
- `session_costs` - Cost breakdown per session
- `session_checkpoints` - LangGraph checkpoint data
- `execution_analytics` - Performance metrics
- `user_preferences` - User configuration
- `agent_performance` - Agent performance data
- `system_metrics` - System monitoring data

### Redis Setup

Redis is used for:
- Real-time execution state
- Pub/sub for live updates
- Session locks and coordination
- Caching and performance

## 🔧 Service Management

### Starting Services

```bash
# Start all services
docker-compose -f docker-compose.expert-consultation.yml up -d

# Start specific service
docker-compose -f docker-compose.expert-consultation.yml up -d expert-consultation
```

### Stopping Services

```bash
# Stop all services
docker-compose -f docker-compose.expert-consultation.yml down

# Stop and remove volumes
docker-compose -f docker-compose.expert-consultation.yml down -v
```

### Viewing Logs

```bash
# View all logs
docker-compose -f docker-compose.expert-consultation.yml logs -f

# View specific service logs
docker-compose -f docker-compose.expert-consultation.yml logs -f expert-consultation

# View last 100 lines
docker-compose -f docker-compose.expert-consultation.yml logs --tail=100 expert-consultation
```

### Health Checks

```bash
# Basic health check
curl http://localhost:8001/health

# Detailed health check
curl http://localhost:8001/health/detailed

# Readiness check
curl http://localhost:8001/health/ready

# Liveness check
curl http://localhost:8001/health/live
```

## 📊 Monitoring

### Service Metrics

The service exposes Prometheus metrics at `/metrics`:

```bash
curl http://localhost:8001/metrics
```

### Prometheus Setup (Optional)

To enable Prometheus monitoring:

```bash
# Start with monitoring profile
docker-compose -f docker-compose.expert-consultation.yml --profile monitoring up -d

# Access Prometheus at http://localhost:9090
# Access Grafana at http://localhost:3001 (admin/admin)
```

### Log Monitoring

Logs are written to the `./logs` directory and can be monitored with:

```bash
# Follow logs in real-time
tail -f logs/expert-consultation.log

# Search for errors
grep -i error logs/expert-consultation.log
```

## 🧪 Testing

### API Testing

The service provides comprehensive API endpoints for testing:

#### Mode Recommendation
```bash
curl -X POST http://localhost:8001/expert/modes/recommend-mode \
  -H "Content-Type: application/json" \
  -d '{"query": "What are regulatory requirements for Phase III trials?", "user_id": "test_user"}'
```

#### Create Session
```bash
curl -X POST http://localhost:8001/expert/modes/sessions/start \
  -H "Content-Type: application/json" \
  -d '{"user_id": "test_user", "interaction_mode": "interactive", "agent_mode": "automatic"}'
```

#### Process Query
```bash
curl -X POST http://localhost:8001/expert/modes/sessions/{session_id}/query \
  -H "Content-Type: application/json" \
  -d '{"query": "What are key considerations for Phase III trial design?", "stream": false}'
```

### Load Testing

For load testing, you can use tools like Apache Bench or Artillery:

```bash
# Basic load test
ab -n 100 -c 10 http://localhost:8001/health

# Test with data
ab -n 50 -c 5 -p test_data.json -T application/json http://localhost:8001/expert/modes/recommend-mode
```

## 🔒 Security

### API Key Management

- Store API keys in environment variables
- Never commit API keys to version control
- Use different keys for development and production
- Rotate keys regularly

### Database Security

- Use strong passwords for database users
- Enable SSL connections in production
- Restrict database access to application servers only
- Regular security updates

### Network Security

- Use HTTPS in production
- Configure proper CORS origins
- Implement rate limiting
- Use firewall rules to restrict access

## 🚀 Production Deployment

### Docker Swarm (Recommended)

```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.expert-consultation.yml vital-expert

# Check status
docker stack services vital-expert
```

### Kubernetes

Create Kubernetes manifests:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: expert-consultation
spec:
  replicas: 3
  selector:
    matchLabels:
      app: expert-consultation
  template:
    metadata:
      labels:
        app: expert-consultation
    spec:
      containers:
      - name: expert-consultation
        image: vital/expert-consultation:latest
        ports:
        - containerPort: 8001
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: expert-consultation-secrets
              key: database-url
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: expert-consultation-secrets
              key: redis-url
        livenessProbe:
          httpGet:
            path: /health/live
            port: 8001
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health/ready
            port: 8001
          initialDelaySeconds: 5
          periodSeconds: 5
```

### AWS ECS

1. Build and push Docker image to ECR
2. Create ECS task definition
3. Create ECS service
4. Configure load balancer
5. Set up auto-scaling

### Google Cloud Run

1. Build and push Docker image to GCR
2. Deploy to Cloud Run
3. Configure environment variables
4. Set up monitoring and logging

## 📈 Scaling

### Horizontal Scaling

- Run multiple instances behind a load balancer
- Use Redis for session state sharing
- Implement sticky sessions if needed
- Monitor resource usage

### Vertical Scaling

- Increase CPU and memory for instances
- Optimize database queries
- Use connection pooling
- Cache frequently accessed data

### Database Scaling

- Use read replicas for analytics queries
- Implement database sharding if needed
- Use connection pooling
- Monitor query performance

## 🔄 Maintenance

### Regular Tasks

- Monitor service health and performance
- Review and rotate API keys
- Update dependencies and security patches
- Clean up old session data
- Backup database regularly

### Backup Strategy

```bash
# Database backup
docker-compose -f docker-compose.expert-consultation.yml exec postgres pg_dump -U vital vital_expert_consultation > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore database
docker-compose -f docker-compose.expert-consultation.yml exec -T postgres psql -U vital vital_expert_consultation < backup_file.sql
```

### Updates

```bash
# Pull latest changes
git pull origin main

# Rebuild and restart services
docker-compose -f docker-compose.expert-consultation.yml build
docker-compose -f docker-compose.expert-consultation.yml up -d

# Run migrations if needed
docker-compose -f docker-compose.expert-consultation.yml exec expert-consultation python -m alembic upgrade head
```

## 🆘 Troubleshooting

### Common Issues

#### Service Won't Start
- Check Docker is running
- Verify environment variables
- Check port conflicts
- Review logs for errors

#### Database Connection Issues
- Verify database is running
- Check connection string
- Verify credentials
- Check network connectivity

#### Redis Connection Issues
- Verify Redis is running
- Check Redis URL
- Verify Redis configuration
- Check memory usage

#### API Key Issues
- Verify API keys are correct
- Check key permissions
- Verify billing/usage limits
- Check key expiration

### Debug Mode

Enable debug logging:

```bash
# Set environment variable
export LOG_LEVEL=DEBUG

# Restart service
docker-compose -f docker-compose.expert-consultation.yml restart expert-consultation
```

### Performance Issues

- Check resource usage (CPU, memory, disk)
- Monitor database query performance
- Check Redis memory usage
- Review application logs
- Use profiling tools

## 📞 Support

For issues and questions:

1. Check the logs first
2. Review this documentation
3. Check the GitHub issues
4. Contact the development team

## 🎯 Next Steps

After successful deployment:

1. Configure monitoring and alerting
2. Set up automated backups
3. Implement CI/CD pipeline
4. Configure load balancing
5. Set up SSL certificates
6. Implement rate limiting
7. Configure logging aggregation
8. Set up performance monitoring

---

**Congratulations!** 🎉 Your VITAL Expert Consultation service is now deployed and ready for production use!
