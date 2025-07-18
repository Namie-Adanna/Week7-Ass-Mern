// Simple uptime monitoring script
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

class UptimeMonitor {
  constructor(config) {
    this.config = {
      interval: 60000, // 1 minute
      timeout: 10000,  // 10 seconds
      retries: 3,
      logFile: 'uptime.log',
      ...config
    };
    
    this.services = config.services || [];
    this.stats = {};
    
    // Initialize stats for each service
    this.services.forEach(service => {
      this.stats[service.name] = {
        uptime: 0,
        downtime: 0,
        totalChecks: 0,
        consecutiveFailures: 0,
        lastCheck: null,
        status: 'unknown'
      };
    });
  }

  async checkService(service) {
    const startTime = Date.now();
    
    return new Promise((resolve) => {
      const url = new URL(service.url);
      const client = url.protocol === 'https:' ? https : http;
      
      const request = client.get(service.url, {
        timeout: this.config.timeout,
        headers: {
          'User-Agent': 'MERN-Blog-Uptime-Monitor/1.0'
        }
      }, (response) => {
        const responseTime = Date.now() - startTime;
        const isHealthy = response.statusCode >= 200 && response.statusCode < 400;
        
        resolve({
          service: service.name,
          url: service.url,
          status: isHealthy ? 'up' : 'down',
          statusCode: response.statusCode,
          responseTime,
          timestamp: new Date().toISOString()
        });
      });

      request.on('error', (error) => {
        const responseTime = Date.now() - startTime;
        resolve({
          service: service.name,
          url: service.url,
          status: 'down',
          error: error.message,
          responseTime,
          timestamp: new Date().toISOString()
        });
      });

      request.on('timeout', () => {
        request.destroy();
        const responseTime = Date.now() - startTime;
        resolve({
          service: service.name,
          url: service.url,
          status: 'down',
          error: 'Request timeout',
          responseTime,
          timestamp: new Date().toISOString()
        });
      });
    });
  }

  async checkAllServices() {
    const results = [];
    
    for (const service of this.services) {
      let result = null;
      let attempts = 0;
      
      // Retry logic
      while (attempts < this.config.retries && (!result || result.status === 'down')) {
        if (attempts > 0) {
          await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s between retries
        }
        result = await this.checkService(service);
        attempts++;
      }
      
      results.push(result);
      this.updateStats(result);
    }
    
    return results;
  }

  updateStats(result) {
    const stats = this.stats[result.service];
    stats.totalChecks++;
    stats.lastCheck = result.timestamp;
    
    if (result.status === 'up') {
      stats.uptime++;
      stats.consecutiveFailures = 0;
      stats.status = 'up';
    } else {
      stats.downtime++;
      stats.consecutiveFailures++;
      stats.status = 'down';
    }
  }

  getUptimePercentage(serviceName) {
    const stats = this.stats[serviceName];
    if (stats.totalChecks === 0) return 0;
    return ((stats.uptime / stats.totalChecks) * 100).toFixed(2);
  }

  logResult(result) {
    const logEntry = {
      timestamp: result.timestamp,
      service: result.service,
      status: result.status,
      responseTime: result.responseTime,
      statusCode: result.statusCode,
      error: result.error
    };
    
    const logLine = JSON.stringify(logEntry) + '\n';
    
    // Append to log file
    fs.appendFileSync(this.config.logFile, logLine);
    
    // Console output
    const statusIcon = result.status === 'up' ? '✅' : '❌';
    const responseTime = result.responseTime ? `${result.responseTime}ms` : 'N/A';
    
    console.log(`${statusIcon} ${result.service} - ${result.status.toUpperCase()} (${responseTime})`);
    
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  }

  async sendAlert(result) {
    const stats = this.stats[result.service];
    
    // Send alert if service is down for consecutive failures
    if (stats.consecutiveFailures >= 3) {
      console.log(`🚨 ALERT: ${result.service} has been down for ${stats.consecutiveFailures} consecutive checks`);
      
      // Here you could integrate with notification services like:
      // - Email notifications
      // - Slack webhooks
      // - Discord webhooks
      // - SMS services
      // - PagerDuty
    }
    
    // Send recovery alert
    if (result.status === 'up' && stats.consecutiveFailures === 0 && stats.downtime > 0) {
      console.log(`🎉 RECOVERY: ${result.service} is back online`);
    }
  }

  generateReport() {
    console.log('\n📊 UPTIME REPORT');
    console.log('================');
    
    this.services.forEach(service => {
      const stats = this.stats[service.name];
      const uptime = this.getUptimePercentage(service.name);
      const statusIcon = stats.status === 'up' ? '✅' : '❌';
      
      console.log(`${statusIcon} ${service.name}`);
      console.log(`   URL: ${service.url}`);
      console.log(`   Uptime: ${uptime}%`);
      console.log(`   Total Checks: ${stats.totalChecks}`);
      console.log(`   Last Check: ${stats.lastCheck || 'Never'}`);
      console.log('');
    });
  }

  async start() {
    console.log('🔍 Starting uptime monitoring...');
    console.log(`Monitoring ${this.services.length} services every ${this.config.interval / 1000} seconds`);
    console.log('');
    
    // Initial check
    await this.runCheck();
    
    // Schedule regular checks
    setInterval(async () => {
      await this.runCheck();
    }, this.config.interval);
    
    // Generate report every hour
    setInterval(() => {
      this.generateReport();
    }, 60 * 60 * 1000);
  }

  async runCheck() {
    const results = await this.checkAllServices();
    
    for (const result of results) {
      this.logResult(result);
      await this.sendAlert(result);
    }
  }
}

// Configuration
const monitorConfig = {
  interval: 60000, // Check every minute
  timeout: 10000,  // 10 second timeout
  retries: 3,      // Retry 3 times before marking as down
  logFile: path.join(__dirname, 'uptime.log'),
  services: [
    {
      name: 'Frontend',
      url: process.env.FRONTEND_URL || 'http://localhost:3000'
    },
    {
      name: 'Backend API',
      url: (process.env.BACKEND_URL || 'http://localhost:5000') + '/api/health'
    },
    {
      name: 'Backend Root',
      url: process.env.BACKEND_URL || 'http://localhost:5000'
    }
  ]
};

// Start monitoring if this file is run directly
if (require.main === module) {
  const monitor = new UptimeMonitor(monitorConfig);
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n👋 Shutting down uptime monitor...');
    monitor.generateReport();
    process.exit(0);
  });
  
  monitor.start().catch(console.error);
}

module.exports = UptimeMonitor;