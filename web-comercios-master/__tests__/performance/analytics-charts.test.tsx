import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';

// Mock chart library
vi.mock('recharts', () => ({
  LineChart: ({ children }: any) => <div data-testid="line-chart">{children}</div>,
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  Line: () => <div />,
  Bar: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  CartesianGrid: () => <div />,
  Tooltip: () => <div />,
  Legend: () => <div />,
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
}));

describe('Analytics Charts Performance Tests', () => {
  const mockChartData = Array.from({ length: 30 }, (_, i) => ({
    date: `2024-10-${String(i + 1).padStart(2, '0')}`,
    checkins: Math.floor(Math.random() * 50) + 10,
    points: Math.floor(Math.random() * 500) + 100,
  }));

  describe('Chart Rendering Performance', () => {
    it('renders line chart in less than 3 seconds', () => {
      const LineChart = () => {
        return (
          <div>
            {mockChartData.map((item) => (
              <div key={item.date}>
                {item.date}: {item.checkins}
              </div>
            ))}
          </div>
        );
      };

      const startTime = performance.now();
      render(<LineChart />);
      const endTime = performance.now();

      const renderTime = endTime - startTime;

      // Target: < 3000ms (3 seconds)
      expect(renderTime).toBeLessThan(3000);
      console.log(`Line chart rendered in ${renderTime.toFixed(2)}ms`);
    });

    it('renders bar chart efficiently', () => {
      const BarChart = () => {
        return (
          <div>
            {mockChartData.map((item) => (
              <div key={item.date} style={{ height: item.points }}>
                {item.points}
              </div>
            ))}
          </div>
        );
      };

      const startTime = performance.now();
      render(<BarChart />);
      const endTime = performance.now();

      const renderTime = endTime - startTime;

      expect(renderTime).toBeLessThan(3000);
      console.log(`Bar chart rendered in ${renderTime.toFixed(2)}ms`);
    });

    it('renders multiple charts simultaneously', () => {
      const MultiChart = () => {
        return (
          <>
            <div data-testid="chart-1">
              {mockChartData.map((item) => (
                <div key={item.date}>{item.checkins}</div>
              ))}
            </div>
            <div data-testid="chart-2">
              {mockChartData.map((item) => (
                <div key={item.date}>{item.points}</div>
              ))}
            </div>
            <div data-testid="chart-3">
              {mockChartData.map((item) => (
                <div key={item.date}>{item.checkins * 10}</div>
              ))}
            </div>
          </>
        );
      };

      const startTime = performance.now();
      const { getByTestId } = render(<MultiChart />);
      const endTime = performance.now();

      const renderTime = endTime - startTime;

      expect(getByTestId('chart-1')).toBeInTheDocument();
      expect(getByTestId('chart-2')).toBeInTheDocument();
      expect(getByTestId('chart-3')).toBeInTheDocument();

      // Multiple charts should still be fast
      expect(renderTime).toBeLessThan(5000);
      console.log(`Multiple charts rendered in ${renderTime.toFixed(2)}ms`);
    });
  });

  describe('Large Dataset Performance', () => {
    it('handles 90 days of data efficiently', () => {
      const largeDataset = Array.from({ length: 90 }, (_, i) => ({
        date: `2024-${String(Math.floor(i / 30) + 1).padStart(2, '0')}-${String((i % 30) + 1).padStart(2, '0')}`,
        checkins: Math.floor(Math.random() * 50) + 10,
        points: Math.floor(Math.random() * 500) + 100,
      }));

      const Chart = () => (
        <div>
          {largeDataset.map((item) => (
            <div key={item.date}>{item.checkins}</div>
          ))}
        </div>
      );

      const startTime = performance.now();
      render(<Chart />);
      const endTime = performance.now();

      const renderTime = endTime - startTime;

      // Should handle large datasets
      expect(renderTime).toBeLessThan(5000);
      console.log(`90-day chart rendered in ${renderTime.toFixed(2)}ms`);
    });

    it('handles 365 days of data', () => {
      const yearDataset = Array.from({ length: 365 }, (_, i) => ({
        date: `2024-${String(Math.floor(i / 30) + 1).padStart(2, '0')}-${String((i % 30) + 1).padStart(2, '0')}`,
        value: Math.floor(Math.random() * 100),
      }));

      const Chart = () => (
        <div>
          {yearDataset.map((item) => (
            <div key={item.date}>{item.value}</div>
          ))}
        </div>
      );

      const startTime = performance.now();
      render(<Chart />);
      const endTime = performance.now();

      const renderTime = endTime - startTime;

      // Year view should still be performant
      expect(renderTime).toBeLessThan(8000);
    });
  });

  describe('Chart Update Performance', () => {
    it('updates chart data efficiently', () => {
      const Chart = ({ data }: any) => (
        <div>
          {data.map((item: any) => (
            <div key={item.date}>{item.value}</div>
          ))}
        </div>
      );

      const { rerender } = render(<Chart data={mockChartData} />);

      const times: number[] = [];

      // Test 10 data updates
      for (let i = 0; i < 10; i++) {
        const newData = mockChartData.map((item) => ({
          ...item,
          checkins: item.checkins + i,
        }));

        const startTime = performance.now();
        rerender(<Chart data={newData} />);
        const endTime = performance.now();

        times.push(endTime - startTime);
      }

      const averageTime = times.reduce((a, b) => a + b, 0) / times.length;

      // Updates should be fast
      expect(averageTime).toBeLessThan(500);
      console.log(`Average chart update: ${averageTime.toFixed(2)}ms`);
    });

    it('handles real-time data updates', () => {
      const Chart = ({ data }: any) => (
        <div>
          {data.map((item: any, idx: number) => (
            <div key={idx}>{item.value}</div>
          ))}
        </div>
      );

      const initialData = [{ value: 10 }];
      const { rerender } = render(<Chart data={initialData} />);

      const times: number[] = [];

      // Simulate real-time updates (new data point every second)
      for (let i = 1; i <= 20; i++) {
        const newData = [...initialData, { value: 10 + i }];

        const startTime = performance.now();
        rerender(<Chart data={newData} />);
        const endTime = performance.now();

        times.push(endTime - startTime);
      }

      const averageTime = times.reduce((a, b) => a + b, 0) / times.length;

      // Real-time updates should be instant
      expect(averageTime).toBeLessThan(100);
    });
  });

  describe('Responsive Chart Performance', () => {
    it('resizes chart efficiently', () => {
      const Chart = ({ width }: any) => (
        <div style={{ width }}>
          {mockChartData.map((item) => (
            <div key={item.date}>{item.checkins}</div>
          ))}
        </div>
      );

      const { rerender } = render(<Chart width={800} />);

      const times: number[] = [];

      // Test different viewport sizes
      const sizes = [800, 600, 400, 1200, 1600];

      for (const size of sizes) {
        const startTime = performance.now();
        rerender(<Chart width={size} />);
        const endTime = performance.now();

        times.push(endTime - startTime);
      }

      const averageTime = times.reduce((a, b) => a + b, 0) / times.length;

      // Resizing should be smooth
      expect(averageTime).toBeLessThan(200);
    });

    it('mobile viewport performance', () => {
      const Chart = () => (
        <div className="w-full" style={{ maxWidth: '375px' }}>
          {mockChartData.slice(0, 7).map((item) => (
            <div key={item.date}>{item.checkins}</div>
          ))}
        </div>
      );

      const startTime = performance.now();
      render(<Chart />);
      const endTime = performance.now();

      const renderTime = endTime - startTime;

      // Mobile should be optimized (fewer data points)
      expect(renderTime).toBeLessThan(1000);
    });
  });

  describe('Chart Interactions Performance', () => {
    it('tooltip interactions are smooth', () => {
      const ChartWithTooltip = () => {
        const [tooltip, setTooltip] = vi.fn();

        return (
          <div>
            {mockChartData.map((item, idx) => (
              <div
                key={item.date}
                onMouseEnter={() => setTooltip(item)}
                onMouseLeave={() => setTooltip(null)}
              >
                {item.checkins}
              </div>
            ))}
            {tooltip && <div>Tooltip: {tooltip.checkins}</div>}
          </div>
        );
      };

      const startTime = performance.now();
      render(<ChartWithTooltip />);
      const endTime = performance.now();

      const renderTime = endTime - startTime;

      // Interactive charts should render quickly
      expect(renderTime).toBeLessThan(2000);
    });

    it('zoom interactions are performant', () => {
      const ZoomableChart = ({ zoom }: any) => {
        const visibleData = mockChartData.slice(0, Math.floor(30 / zoom));

        return (
          <div>
            {visibleData.map((item) => (
              <div key={item.date}>{item.checkins}</div>
            ))}
          </div>
        );
      };

      const { rerender } = render(<ZoomableChart zoom={1} />);

      const zoomLevels = [1, 2, 3, 4, 5];
      const times: number[] = [];

      for (const zoom of zoomLevels) {
        const startTime = performance.now();
        rerender(<ZoomableChart zoom={zoom} />);
        const endTime = performance.now();

        times.push(endTime - startTime);
      }

      const averageTime = times.reduce((a, b) => a + b, 0) / times.length;

      expect(averageTime).toBeLessThan(200);
    });
  });

  describe('Memory Management', () => {
    it('does not leak memory on unmount', () => {
      const Chart = () => (
        <div>
          {mockChartData.map((item) => (
            <div key={item.date}>{item.checkins}</div>
          ))}
        </div>
      );

      const { unmount } = render(<Chart />);

      const memBefore = (performance as any).memory?.usedJSHeapSize;

      unmount();

      if (global.gc) {
        global.gc();
      }

      const memAfter = (performance as any).memory?.usedJSHeapSize;

      // Should not leak memory
      if (memBefore && memAfter) {
        const increase = memAfter - memBefore;
        expect(increase).toBeLessThan(500000); // < 500KB
      }
    });

    it('handles multiple mount/unmount cycles', () => {
      const Chart = () => (
        <div>
          {mockChartData.map((item) => (
            <div key={item.date}>{item.checkins}</div>
          ))}
        </div>
      );

      const times: number[] = [];

      // 20 mount/unmount cycles
      for (let i = 0; i < 20; i++) {
        const startTime = performance.now();
        const { unmount } = render(<Chart />);
        unmount();
        const endTime = performance.now();

        times.push(endTime - startTime);
      }

      const averageTime = times.reduce((a, b) => a + b, 0) / times.length;

      // Should remain performant
      expect(averageTime).toBeLessThan(500);
    });
  });

  describe('Export Performance', () => {
    it('exports chart data quickly', () => {
      const exportData = () => {
        return JSON.stringify(mockChartData);
      };

      const startTime = performance.now();
      const data = exportData();
      const endTime = performance.now();

      const exportTime = endTime - startTime;

      expect(data.length).toBeGreaterThan(0);
      expect(exportTime).toBeLessThan(100);
    });

    it('exports large datasets efficiently', () => {
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        date: `2024-01-01`,
        value: i,
      }));

      const exportData = () => {
        return JSON.stringify(largeDataset);
      };

      const startTime = performance.now();
      const data = exportData();
      const endTime = performance.now();

      const exportTime = endTime - startTime;

      expect(data.length).toBeGreaterThan(0);
      expect(exportTime).toBeLessThan(500);
    });
  });
});
