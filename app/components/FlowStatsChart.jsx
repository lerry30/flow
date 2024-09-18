import { View, Text } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { useLayoutEffect, useState } from 'react';

const FlowStatsChart = ({ months, monthlyIn, monthlyOut }) => {
    const [data, setData] = useState([]);
    const [barHeights, setBarHeights] = useState([0]);
    const [largest, setLargest] = useState(100000);

    useLayoutEffect(() => {
        const updatedData = [];
        let largestPeak = 0;

        for (const month of months) {
            const label = `${month[0].toUpperCase()}${month.substring(1)}`;
            const outsValue = monthlyOut[month] || 0;  // Ensure values are not undefined
            const insValue = monthlyIn[month] || 0;

            // "Out" data (red color)
            updatedData.push({
                value: outsValue,
                frontColor: '#fc3f1c',
                label,
            });

            // "In" data (teal color)
            updatedData.push({
                value: insValue,
                frontColor: '#3BE9DE',
            });

            largestPeak = Math.max(outsValue, insValue, largestPeak);
        }

        setData(updatedData);

        // Calculate bar heights for Y-axis labels
        largestPeak = Math.ceil(largestPeak / 10) * 10; // Round up to nearest 1000 for better scaling
        const heights = Array(7).fill(0).map((_, index) => largestPeak * index / 6);
        setBarHeights(heights);

        console.log(largestPeak);
        setLargest(largestPeak);
    }, [months, monthlyIn, monthlyOut]);

    return (
        <View
            style={{
                padding: 16,
                borderRadius: 20,
                backgroundColor: '#f5f5f5',
            }}>
            <Text style={{ color: '#2e2e2e', fontSize: 16, fontWeight: 'bold' }}>Overview</Text>
            <View style={{ padding: 20, alignItems: 'center', overflow: 'hidden' }}>
                <BarChart
                    data={data}
                    barWidth={16}
                    initialSpacing={10}
                    spacing={14}
                    barBorderRadius={4}
                    showGradient={false}  // Gradient disabled
                    yAxisThickness={0}
                    xAxisType={'dashed'}
                    xAxisColor={'#2e2e2e'}
                    yAxisTextStyle={{ color: '#2e2e2e' }}
                    stepValue={Math.ceil(largest / 6)} // Dynamically calculate step value
                    maxValue={largest} // Use calculated largest value
                    noOfSections={6}
                    yAxisLabelTexts={barHeights.map(height => height.toString())}
                    labelWidth={40}
                    xAxisLabelTextStyle={{ color: '#2e2e2e', textAlign: 'center' }}
                />
            </View>
        </View>
    );
};

export default FlowStatsChart;

