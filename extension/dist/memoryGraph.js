/**
 * Memory Graph Visualization
 * D3-based graph showing related memories
 */

import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';

export class MemoryGraph {
  constructor(containerId, memories) {
    this.containerId = containerId;
    this.memories = memories || [];
    this.width = 300;
    this.height = 300;
    this.init();
  }

  init() {
    const container = document.getElementById(this.containerId);
    if (!container) return;

    // Create SVG
    this.svg = d3.select(`#${this.containerId}`)
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height);

    // Create force simulation
    this.simulation = d3.forceSimulation(this.memories)
      .force('link', d3.forceLink().id(d => d.id).distance(50))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(this.width / 2, this.height / 2));

    this.render();
  }

  render() {
    // Create links
    const links = this.svg.append('g')
      .selectAll('line')
      .data(this.simulation.force('link').links())
      .enter()
      .append('line')
      .attr('stroke', '#667eea')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', 2);

    // Create nodes
    const nodes = this.svg.append('g')
      .selectAll('circle')
      .data(this.memories)
      .enter()
      .append('circle')
      .attr('r', 8)
      .attr('fill', '#667eea')
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .call(this.drag());

    // Add labels
    const labels = this.svg.append('g')
      .selectAll('text')
      .data(this.memories)
      .enter()
      .append('text')
      .text(d => d.title || d.content.substring(0, 20))
      .attr('font-size', '10px')
      .attr('fill', '#333')
      .attr('dx', 10)
      .attr('dy', 4);

    // Update positions on tick
    this.simulation.on('tick', () => {
      links
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      nodes
        .attr('cx', d => d.x)
        .attr('cy', d => d.y);

      labels
        .attr('x', d => d.x)
        .attr('y', d => d.y);
    });
  }

  drag() {
    return d3.drag()
      .on('start', (event, d) => {
        if (!event.active) this.simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on('drag', (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on('end', (event, d) => {
        if (!event.active) this.simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      });
  }

  update(memories) {
    this.memories = memories;
    this.simulation.nodes(this.memories);
    this.simulation.alpha(1).restart();
    this.render();
  }
}

