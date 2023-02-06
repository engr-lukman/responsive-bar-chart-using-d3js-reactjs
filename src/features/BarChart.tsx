import * as d3 from 'd3';
import { FC, useEffect, useRef } from 'react';

import Spinner from 'components/Spinner';
import { useResizeObserver } from 'hooks/useResizeObserver';

const BarChart: FC<IChart> = ({ data, svgWrapperRef, margin, isYaxisRight = false }) => {
  const dimensions: any = useResizeObserver(svgWrapperRef);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef?.current || !dimensions) return;

    // Initialize the height, width and max value
    const innerWidth: number = dimensions?.width - margin?.right;
    const innerHeight: number = dimensions?.height - (margin?.top + margin?.bottom);
    const maxValue: number = Math.max(...data?.map(({ value }) => value));

    const svg = d3.select(svgRef?.current);

    // Create x-axis scale
    const xScale: any = d3
      .scaleBand()
      .domain([...data?.map(({ label }) => label)])
      .rangeRound([margin?.left, innerWidth])
      .padding(0.5);

    // Create y-axis scale
    const yScale: any = d3.scaleLinear().domain([0, maxValue]).rangeRound([innerHeight, margin?.top]);

    // Create x-axis
    const xAxis: any = d3.axisBottom(xScale).ticks(data?.length);
    svg
      .select('.x-axis')
      .style('transform', `translateY(${innerHeight}px)`)
      .style('color', 'steelblue')
      .style('font-size', 10)
      .call(xAxis)
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-5px')
      .attr('dy', '4px')
      .attr('transform', 'rotate(-30)');

    // Create y-axis for left side
    const yAxis: any = d3.axisLeft(yScale).ticks(5);
    svg
      .select('.y-axis')
      .style('transform', `translateX(${margin?.left}px)`)
      .style('color', 'steelblue')
      .style('font-size', 10)
      .call(yAxis);

    // Create y-axis for right side
    const yAxisRight: any = d3.axisRight(yScale).ticks(5);
    svg
      .select('.y-axis-right')
      .style('transform', `translateX(${dimensions?.width - margin?.right}px)`)
      .style('color', 'steelblue')
      .style('font-size', 10)
      .call(yAxisRight);

    // Draw the bars
    svg
      .selectAll('.bar')
      .data([...data])
      .join('rect')
      .attr('class', 'bar')
      .style('transform', 'scale(1, -1)')
      .attr('x', ({ label }) => xScale(label))
      .attr('width', xScale.bandwidth())
      .attr('y', -innerHeight)
      .style('cursor', 'pointer')
      .style('fill', ({ fillColor }) => fillColor)
      .on('mouseenter', (event, item) => {
        svg
          .selectAll('.tooltip')
          .data([item?.value])
          .join((enter) => enter.append('text').attr('y', yScale(item?.value) - 4))
          .attr('class', 'tooltip')
          .text(`${item?.value}`)
          .attr('x', xScale(item?.label) + xScale.bandwidth() / 2)
          .style('font-size', '10px')
          .attr('text-anchor', 'middle')
          .transition()
          .duration(500)
          .attr('y', yScale(item?.value) - 8)
          .style('font-size', '14px')
          .style('fill', item?.fillColor)
          .style('opacity', 1);
      })
      .on('mouseleave', () => svg.select('.tooltip').remove())
      .transition()
      .style('fill', ({ fillColor }) => fillColor)
      .attr('height', ({ value }) => innerHeight - yScale(value));
  }, [data, dimensions]);

  if (!dimensions) {
    return (
      <div className="flex w-full justify-center items-center py-2">
        <Spinner className="text-gray-300 h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="d3js">
      <svg ref={svgRef} width={`${dimensions?.width}`} height={dimensions?.height}>
        <g className="x-axis" />
        {isYaxisRight ? <g className="y-axis-right" /> : <g className="y-axis" />}
      </svg>
    </div>
  );
};

interface IData {
  label: string;
  value: number;
  fillColor: string;
}

interface IChart {
  data: IData[];
  svgWrapperRef: any;
  margin: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  isYaxisRight?: boolean;
}

export default BarChart;
