# CoreSIS Monitoring & Observability Guide

## 📊 Monitoring Overview

CoreSIS implements comprehensive monitoring and observability to ensure system reliability, performance, and user experience. Our monitoring strategy covers infrastructure, application, and business metrics.

### Monitoring Pillars
1. **Infrastructure Monitoring** - Server health, resources, and availability
2. **Application Monitoring** - Performance, errors, and user experience
3. **Business Monitoring** - User activity, feature usage, and business metrics
4. **Security Monitoring** - Threats, vulnerabilities, and compliance

---

## 🏗️ Monitoring Architecture

### Monitoring Stack

#### Core Components
- **Prometheus** - Metrics collection and storage
- **Grafana** - Visualization and dashboards
- **AlertManager** - Alert routing and notification
- **Jaeger** - Distributed tracing
- **ELK Stack** - Log aggregation and analysis

#### Infrastructure
- **UptimeRobot** - External uptime monitoring
- **CloudWatch** - AWS resource monitoring (if applicable)
- **Docker** - Container health monitoring
- **Nginx** - Web server monitoring

### Data Flow
```
Application → Prometheus → Grafana
     ↓
   Logs → ELK Stack → Kibana
     ↓
  Traces → Jaeger → UI
     ↓
  Alerts → AlertManager → Slack/Email
```

---

## 📈 Metrics Collection

### Application Metrics

#### Backend Metrics (Prometheus)
```javascript
// sis-backend/middleware/metrics.js
const prometheus = require('prom-client');

// HTTP metrics
const httpRequestDuration = new prometheus.Histogram({
  name: 'coresis_http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code', 'user_role'],
  buckets: [0.1, 0.5, 1, 2, 5, 10]
});

const httpRequestTotal = new prometheus.Counter({
  name: 'coresis_http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code', 'user_role']
});

// Business metrics
const activeUsers = new prometheus.Gauge({
  name: 'coresis_active_users',
  help: 'Number of active users'
});

const studentEnrollments = new prometheus.Counter({
  name: 'coresis_student_enrollments_total',
  help: 'Total number of student enrollments'
});

const courseCompletions = new prometheus.Counter({
  name: 'coresis_course_completions_total',
  help: 'Total number of course completions'
});

// Database metrics
const databaseConnections = new prometheus.Gauge({
  name: 'coresis_database_connections',
  help: 'Number of active database connections'
});

const databaseQueryDuration = new prometheus.Histogram({
  name: 'coresis_database_query_duration_seconds',
  help: 'Duration of database queries in seconds',
  labelNames: ['operation', 'collection']
});

// Custom metrics middleware
const metricsMiddleware = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const userRole = req.user?.role || 'anonymous';
    
    httpRequestDuration
      .labels(req.method, req.route?.path || req.path, res.statusCode, userRole)
      .observe(duration);
    
    httpRequestTotal
      .labels(req.method, req.route?.path || req.path, res.statusCode, userRole)
      .inc();
  });
  
  next();
};

module.exports = {
  metricsMiddleware,
  httpRequestDuration,
  httpRequestTotal,
  activeUsers,
  studentEnrollments,
  courseCompletions,
  databaseConnections,
  databaseQueryDuration
};
```

#### Frontend Metrics
```javascript
// frontend/src/utils/analytics.js
export const trackPageView = (page) => {
  // Send to analytics service
  if (window.gtag) {
    window.gtag('config', 'GA_MEASUREMENT_ID', {
      page_title: page,
      page_location: window.location.href
    });
  }
  
  // Send to internal metrics
  fetch('/api/metrics/pageview', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ page, timestamp: Date.now() })
  });
};

export const trackEvent = (event, parameters = {}) => {
  // Send to analytics service
  if (window.gtag) {
    window.gtag('event', event, parameters);
  }
  
  // Send to internal metrics
  fetch('/api/metrics/event', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event, parameters, timestamp: Date.now() })
  });
};

export const trackPerformance = () => {
  window.addEventListener('load', () => {
    const navigation = performance.getEntriesByType('navigation')[0];
    const paint = performance.getEntriesByType('paint');
    
    const metrics = {
      loadTime: navigation.loadEventEnd - navigation.loadEventStart,
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      firstPaint: paint.find(p => p.name === 'first-paint')?.startTime,
      firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime
    };
    
    // Send performance metrics
    fetch('/api/metrics/performance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ metrics, timestamp: Date.now() })
    });
  });
};
```

### Infrastructure Metrics

#### Docker Metrics
```yaml
# docker-compose.monitoring.yml
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
      - '--storage.tsdb.retention.time=200h'
      - '--web.enable-lifecycle'

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana_data:/var/lib/grafana
      - ./grafana/dashboards:/etc/grafana/provisioning/dashboards
      - ./grafana/datasources:/etc/grafana/provisioning/datasources

  alertmanager:
    image: prom/alertmanager:latest
    ports:
      - "9093:9093"
    volumes:
      - ./alertmanager.yml:/etc/alertmanager/alertmanager.yml
      - alertmanager_data:/alertmanager

volumes:
  prometheus_data:
  grafana_data:
  alertmanager_data:
```

#### Prometheus Configuration
```yaml
# prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "alert_rules.yml"

scrape_configs:
  - job_name: 'coresis-backend'
    static_configs:
      - targets: ['backend:5000']
    metrics_path: '/metrics'
    scrape_interval: 5s

  - job_name: 'coresis-frontend'
    static_configs:
      - targets: ['frontend:80']
    metrics_path: '/metrics'
    scrape_interval: 5s

  - job_name: 'mongodb'
    static_configs:
      - targets: ['mongo:27017']
    scrape_interval: 10s

  - job_name: 'nginx'
    static_configs:
      - targets: ['nginx:80']
    metrics_path: '/nginx_status'
    scrape_interval: 5s
```

---

## 📊 Dashboards

### Main Dashboard

#### System Overview
```json
{
  "dashboard": {
    "title": "CoreSIS System Overview",
    "panels": [
      {
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(coresis_http_requests_total[5m])",
            "legendFormat": "{{method}} {{route}}"
          }
        ],
        "yAxes": [
          {
            "label": "Requests per second"
          }
        ]
      },
      {
        "title": "Response Time (95th percentile)",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(coresis_http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "95th percentile"
          }
        ],
        "yAxes": [
          {
            "label": "Response time (seconds)"
          }
        ]
      },
      {
        "title": "Error Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(coresis_http_requests_total{status_code=~\"5..\"}[5m])",
            "legendFormat": "5xx errors"
          },
          {
            "expr": "rate(coresis_http_requests_total{status_code=~\"4..\"}[5m])",
            "legendFormat": "4xx errors"
          }
        ],
        "yAxes": [
          {
            "label": "Errors per second"
          }
        ]
      },
      {
        "title": "Active Users",
        "type": "stat",
        "targets": [
          {
            "expr": "coresis_active_users"
          }
        ]
      }
    ]
  }
}
```

#### Business Metrics Dashboard
```json
{
  "dashboard": {
    "title": "CoreSIS Business Metrics",
    "panels": [
      {
        "title": "Student Enrollments",
        "type": "graph",
        "targets": [
          {
            "expr": "increase(coresis_student_enrollments_total[24h])",
            "legendFormat": "Enrollments (24h)"
          }
        ]
      },
      {
        "title": "Course Completions",
        "type": "graph",
        "targets": [
          {
            "expr": "increase(coresis_course_completions_total[24h])",
            "legendFormat": "Completions (24h)"
          }
        ]
      },
      {
        "title": "User Activity by Role",
        "type": "piechart",
        "targets": [
          {
            "expr": "sum by (user_role) (rate(coresis_http_requests_total[5m]))",
            "legendFormat": "{{user_role}}"
          }
        ]
      }
    ]
  }
}
```

### Infrastructure Dashboard

#### Server Resources
```json
{
  "dashboard": {
    "title": "CoreSIS Infrastructure",
    "panels": [
      {
        "title": "CPU Usage",
        "type": "graph",
        "targets": [
          {
            "expr": "100 - (avg by (instance) (irate(node_cpu_seconds_total{mode=\"idle\"}[5m])) * 100)",
            "legendFormat": "CPU %"
          }
        ]
      },
      {
        "title": "Memory Usage",
        "type": "graph",
        "targets": [
          {
            "expr": "(node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes * 100",
            "legendFormat": "Memory %"
          }
        ]
      },
      {
        "title": "Disk Usage",
        "type": "graph",
        "targets": [
          {
            "expr": "(node_filesystem_size_bytes - node_filesystem_free_bytes) / node_filesystem_size_bytes * 100",
            "legendFormat": "Disk %"
          }
        ]
      },
      {
        "title": "Network Traffic",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(node_network_receive_bytes_total[5m])",
            "legendFormat": "Receive"
          },
          {
            "expr": "rate(node_network_transmit_bytes_total[5m])",
            "legendFormat": "Transmit"
          }
        ]
      }
    ]
  }
}
```

---

## 🚨 Alerting

### Alert Rules

#### Application Alerts
```yaml
# alert_rules.yml
groups:
  - name: coresis_alerts
    rules:
      # High error rate
      - alert: HighErrorRate
        expr: rate(coresis_http_requests_total{status_code=~"5.."}[5m]) > 0.1
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value }} errors per second"

      # High response time
      - alert: HighResponseTime
        expr: histogram_quantile(0.95, rate(coresis_http_request_duration_seconds_bucket[5m])) > 2
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High response time detected"
          description: "95th percentile response time is {{ $value }} seconds"

      # Low request rate (possible outage)
      - alert: LowRequestRate
        expr: rate(coresis_http_requests_total[5m]) < 0.1
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "Low request rate detected"
          description: "Request rate is {{ $value }} requests per second"

      # Database connection issues
      - alert: DatabaseConnectionIssues
        expr: coresis_database_connections < 1
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Database connection issues"
          description: "No active database connections"

      # High memory usage
      - alert: HighMemoryUsage
        expr: (node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes * 100 > 90
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High memory usage"
          description: "Memory usage is {{ $value }}%"

      # High CPU usage
      - alert: HighCPUUsage
        expr: 100 - (avg by (instance) (irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 80
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High CPU usage"
          description: "CPU usage is {{ $value }}%"

      # Disk space low
      - alert: DiskSpaceLow
        expr: (node_filesystem_size_bytes - node_filesystem_free_bytes) / node_filesystem_size_bytes * 100 > 85
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Disk space low"
          description: "Disk usage is {{ $value }}%"
```

#### Business Alerts
```yaml
  - name: business_alerts
    rules:
      # No active users
      - alert: NoActiveUsers
        expr: coresis_active_users == 0
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "No active users"
          description: "No active users detected for 10 minutes"

      # Unusual enrollment drop
      - alert: EnrollmentDrop
        expr: increase(coresis_student_enrollments_total[1h]) < 1
        for: 2h
        labels:
          severity: warning
        annotations:
          summary: "Low enrollment activity"
          description: "No enrollments in the last 2 hours"
```

### AlertManager Configuration
```yaml
# alertmanager.yml
global:
  resolve_timeout: 5m
  slack_api_url: 'https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK'

route:
  group_by: ['alertname']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 1h
  receiver: 'slack-notifications'
  routes:
    - match:
        severity: critical
      receiver: 'pager-duty-critical'
      continue: true
    - match:
        severity: warning
      receiver: 'slack-notifications'

receivers:
  - name: 'slack-notifications'
    slack_configs:
      - channel: '#alerts'
        title: '{{ template "slack.title" . }}'
        text: '{{ template "slack.text" . }}'
        send_resolved: true

  - name: 'pager-duty-critical'
    pagerduty_configs:
      - service_key: 'YOUR_PAGERDUTY_SERVICE_KEY'
        send_resolved: true

  - name: 'email-notifications'
    email_configs:
      - to: 'alerts@coresis.app'
        send_resolved: true

templates:
  - '/etc/alertmanager/template/*.tmpl'
```

---

## 📝 Logging

### Log Aggregation

#### ELK Stack Configuration
```yaml
# docker-compose.logging.yml
version: '3.8'

services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.8.0
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
    volumes:
      - elasticsearch_data:/usr/share/elasticsearch/data
    ports:
      - "9200:9200"

  logstash:
    image: docker.elastic.co/logstash/logstash:8.8.0
    volumes:
      - ./logstash/pipeline:/usr/share/logstash/pipeline
      - ./logstash/config/logstash.yml:/usr/share/logstash/config/logstash.yml
    ports:
      - "5044:5044"
    depends_on:
      - elasticsearch

  kibana:
    image: docker.elastic.co/kibana/kibana:8.8.0
    environment:
      - ELASTICSEARCH_HOSTS=http://elasticsearch:9200
    ports:
      - "5601:5601"
    depends_on:
      - elasticsearch

volumes:
  elasticsearch_data:
```

#### Logstash Pipeline
```ruby
# logstash/pipeline/coresis.conf
input {
  beats {
    port => 5044
  }
}

filter {
  if [fields][service] == "coresis-backend" {
    grok {
      match => { "message" => "%{TIMESTAMP_ISO8601:timestamp} %{LOGLEVEL:level} %{GREEDYDATA:message}" }
    }
    date {
      match => [ "timestamp", "ISO8601" ]
    }
  }
  
  if [fields][service] == "coresis-frontend" {
    grok {
      match => { "message" => "%{TIMESTAMP_ISO8601:timestamp} %{LOGLEVEL:level} %{GREEDYDATA:message}" }
    }
    date {
      match => [ "timestamp", "ISO8601" ]
    }
  }
}

output {
  elasticsearch {
    hosts => ["elasticsearch:9200"]
    index => "coresis-%{+YYYY.MM.dd}"
  }
}
```

### Application Logging

#### Backend Logging
```javascript
// sis-backend/utils/logger.js
const winston = require('winston');
require('winston-daily-rotate-file');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'coresis-backend' },
  transports: [
    new winston.transports.DailyRotateFile({
      filename: 'logs/coresis-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d'
    }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// Request logging middleware
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('HTTP Request', {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      userId: req.user?.id
    });
  });
  
  next();
};

module.exports = { logger, requestLogger };
```

#### Frontend Logging
```javascript
// frontend/src/utils/logger.js
class Logger {
  constructor() {
    this.logLevel = process.env.NODE_ENV === 'production' ? 'warn' : 'debug';
  }

  log(level, message, data = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    // Send to server
    fetch('/api/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(logEntry)
    }).catch(() => {
      // Fallback to console if server is unavailable
      console[level](message, data);
    });
  }

  debug(message, data) { this.log('debug', message, data); }
  info(message, data) { this.log('info', message, data); }
  warn(message, data) { this.log('warn', message, data); }
  error(message, data) { this.log('error', message, data); }
}

export const logger = new Logger();
```

---

## 🔍 Distributed Tracing

### Jaeger Configuration
```yaml
# docker-compose.tracing.yml
version: '3.8'

services:
  jaeger:
    image: jaegertracing/all-in-one:latest
    ports:
      - "16686:16686"
      - "14268:14268"
    environment:
      - COLLECTOR_OTLP_ENABLED=true
    volumes:
      - jaeger_data:/tmp
    command: --log-level=debug

volumes:
  jaeger_data:
```

### Backend Tracing
```javascript
// sis-backend/utils/tracing.js
const { trace, context } = require('@opentelemetry/api');
const { NodeTracerProvider } = require('@opentelemetry/sdk-trace-node');
const { JaegerExporter } = require('@opentelemetry/exporter-jaeger');
const { registerInstrumentations } = require('@opentelemetry/instrumentation');
const { HttpInstrumentation } = require('@opentelemetry/instrumentation-http');
const { ExpressInstrumentation } = require('@opentelemetry/instrumentation-express');
const { MongoDBInstrumentation } = require('@opentelemetry/instrumentation-mongodb');

const provider = new NodeTracerProvider();
const exporter = new JaegerExporter({
  endpoint: 'http://jaeger:14268/api/traces'
});

provider.addSpanProcessor(new SimpleSpanProcessor(exporter));
provider.register();

registerInstrumentations({
  instrumentations: [
    new HttpInstrumentation(),
    new ExpressInstrumentation(),
    new MongoDBInstrumentation()
  ]
});

const tracer = trace.getTracer('coresis-backend');

// Custom tracing middleware
const tracingMiddleware = (req, res, next) => {
  const span = tracer.startSpan(`${req.method} ${req.path}`);
  
  span.setAttributes({
    'http.method': req.method,
    'http.url': req.url,
    'http.user_agent': req.get('User-Agent'),
    'http.client_ip': req.ip
  });
  
  context.with(trace.setSpan(context.active(), span), () => {
    next();
  });
  
  res.on('finish', () => {
    span.setAttributes({
      'http.status_code': res.statusCode
    });
    span.end();
  });
};

module.exports = { tracer, tracingMiddleware };
```

---

## 📊 Business Intelligence

### Key Performance Indicators (KPIs)

#### User Engagement
- **Daily Active Users (DAU)**
- **Monthly Active Users (MAU)**
- **Session Duration**
- **Pages per Session**
- **Bounce Rate**

#### Academic Metrics
- **Student Enrollment Rate**
- **Course Completion Rate**
- **Average GPA**
- **Time to Graduation**
- **Placement Success Rate**

#### Financial Metrics
- **Revenue per Student**
- **Payment Collection Rate**
- **Outstanding Balance**
- **Refund Rate**
- **Cost per Student**

### Analytics Dashboard
```javascript
// sis-backend/routes/analytics.js
router.get('/analytics/dashboard', async (req, res) => {
  try {
    const [
      totalStudents,
      activeStudents,
      totalCourses,
      completedCourses,
      totalRevenue,
      monthlyRevenue
    ] = await Promise.all([
      Student.countDocuments(),
      Student.countDocuments({ status: 'active' }),
      Course.countDocuments(),
      Course.countDocuments({ status: 'completed' }),
      FinanceRecord.aggregate([
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      FinanceRecord.aggregate([
        { $match: { createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ]);

    res.json({
      success: true,
      data: {
        students: {
          total: totalStudents,
          active: activeStudents,
          percentage: (activeStudents / totalStudents * 100).toFixed(1)
        },
        courses: {
          total: totalCourses,
          completed: completedCourses,
          percentage: (completedCourses / totalCourses * 100).toFixed(1)
        },
        revenue: {
          total: totalRevenue[0]?.total || 0,
          monthly: monthlyRevenue[0]?.total || 0
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics data'
    });
  }
});
```

---

## 🔧 Monitoring Setup

### Installation Script
```bash
#!/bin/bash
# setup-monitoring.sh

echo "Setting up CoreSIS monitoring..."

# Create monitoring directory
mkdir -p monitoring
cd monitoring

# Create Docker Compose file
cat > docker-compose.monitoring.yml << 'EOF'
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--storage.tsdb.retention.time=200h'

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana_data:/var/lib/grafana
      - ./grafana/dashboards:/etc/grafana/provisioning/dashboards
      - ./grafana/datasources:/etc/grafana/provisioning/datasources

  alertmanager:
    image: prom/alertmanager:latest
    ports:
      - "9093:9093"
    volumes:
      - ./alertmanager.yml:/etc/alertmanager/alertmanager.yml
      - alertmanager_data:/alertmanager

  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.8.0
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
    volumes:
      - elasticsearch_data:/usr/share/elasticsearch/data
    ports:
      - "9200:9200"

  kibana:
    image: docker.elastic.co/kibana/kibana:8.8.0
    environment:
      - ELASTICSEARCH_HOSTS=http://elasticsearch:9200
    ports:
      - "5601:5601"
    depends_on:
      - elasticsearch

  jaeger:
    image: jaegertracing/all-in-one:latest
    ports:
      - "16686:16686"
      - "14268:14268"
    environment:
      - COLLECTOR_OTLP_ENABLED=true

volumes:
  prometheus_data:
  grafana_data:
  alertmanager_data:
  elasticsearch_data:
EOF

# Create configuration files
mkdir -p grafana/dashboards grafana/datasources

# Start monitoring stack
docker-compose -f docker-compose.monitoring.yml up -d

echo "Monitoring setup complete!"
echo "Grafana: http://localhost:3000 (admin/admin)"
echo "Prometheus: http://localhost:9090"
echo "Kibana: http://localhost:5601"
echo "Jaeger: http://localhost:16686"
```

---

## 📞 Support & Maintenance

### Monitoring Support
- **Email**: monitoring@coresis.app
- **Slack**: #monitoring channel
- **Documentation**: https://docs.coresis.app/monitoring

### Maintenance Tasks
- **Daily**: Review alerts and resolve issues
- **Weekly**: Update dashboards and review metrics
- **Monthly**: Capacity planning and performance review
- **Quarterly**: Security audit and compliance review

---

*CoreSIS Monitoring Guide v1.0*  
*Last Updated: July 2025*  
*For questions or support, contact monitoring@coresis.app*

**CoreSIS** - Powering Pathways. Fueling Futures. 🚀 