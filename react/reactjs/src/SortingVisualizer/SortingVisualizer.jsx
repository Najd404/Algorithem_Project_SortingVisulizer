import React, { useState, useEffect } from 'react';
import './SortingVisualizer.css';

export const SortingVisualizer = () => {
    const [arrayState, setArrayState] = useState('random');
    const [dataSize, setDataSize] = useState('low');
    const [arrayOne, setArrayOne] = useState([]);
    const [arrayTwo, setArrayTwo] = useState([]);
    const [isSorting, setIsSorting] = useState(false);
    const [quickSortTime, setQuickSortTime] = useState(0);
    const [mergeSortTime, setMergeSortTime] = useState(0);

    // Generate a new array based on selected state and size
    const generateArray = () => {
        const size =
            dataSize === 'low'
                ? 10
                : dataSize === 'medium'
                    ? 50
                    : 100; // Array size based on selection
        let baseArray = Array.from({ length: size }, (_, i) => i + 1);

        if (arrayState === 'reversed') {
            baseArray = baseArray.reverse();
        } else if (arrayState === 'random') {
            baseArray = baseArray.sort(() => Math.random() - 0.5);
        } else if (arrayState === 'almostSorted') {
            const swapCount = Math.ceil(size * 0.1);
            for (let i = 0; i < swapCount; i++) {
                const idx1 = Math.floor(Math.random() * size);
                const idx2 = Math.floor(Math.random() * size);
                [baseArray[idx1], baseArray[idx2]] = [baseArray[idx2], baseArray[idx1]];
            }
        }

        setArrayOne([...baseArray]);
        setArrayTwo([...baseArray]);
    };

    useEffect(() => {
        generateArray();
    }, [arrayState, dataSize]);

    // QuickSort with Median of Three pivot
    const quickSortWithSteps = (array) => {
        const animations = [];
        const quickSortHelper = (arr, start, end) => {
            if (start >= end) return;

            const pivotIndex = medianOfThreePartition(arr, start, end);
            animations.push([...arr]); // Ensure it's an array
            quickSortHelper(arr, start, pivotIndex - 1);
            quickSortHelper(arr, pivotIndex + 1, end);
        };

        const medianOfThreePartition = (arr, start, end) => {
            const mid = Math.floor((start + end) / 2);
            const pivotIndex = [start, mid, end]
                .sort((a, b) => arr[a] - arr[b])[1]; // Median of three pivot selection
            [arr[pivotIndex], arr[end]] = [arr[end], arr[pivotIndex]]; // Swap pivot with end
            return partition(arr, start, end);
        };

        const partition = (arr, start, end) => {
            const pivot = arr[end];
            let i = start - 1;
            for (let j = start; j < end; j++) {
                if (arr[j] < pivot) {
                    i++;
                    [arr[i], arr[j]] = [arr[j], arr[i]];
                }
            }
            [arr[i + 1], arr[end]] = [arr[end], arr[i + 1]];
            return i + 1;
        };

        quickSortHelper(array.slice(), 0, array.length - 1);
        return animations;
    };

    const mergeSortWithSteps = (array) => {
        const animations = [];
        const tempArray = array.slice(); // Temporary array for merging

        let stepCounter = 0; // Initialize counter to track merge steps

        const mergeSortHelper = (arr, start, end) => {
            if (start >= end) return;

            const mid = Math.floor((start + end) / 2);
            mergeSortHelper(arr, start, mid); // Sort the left half
            mergeSortHelper(arr, mid + 1, end); // Sort the right half
            merge(arr, start, mid, end); // Merge the two halves
        };

        // Optimized merge function (in-place update, no slice)
        const merge = (arr, start, mid, end) => {
            let left = start;
            let right = mid + 1;
            let tempIndex = start;

            while (left <= mid && right <= end) {
                if (arr[left] <= arr[right]) {
                    tempArray[tempIndex] = arr[left];
                    left++;
                } else {
                    tempArray[tempIndex] = arr[right];
                    right++;
                }
                tempIndex++;
            }

            // Copy remaining elements
            while (left <= mid) {
                tempArray[tempIndex] = arr[left];
                left++;
                tempIndex++;
            }

            while (right <= end) {
                tempArray[tempIndex] = arr[right];
                right++;
                tempIndex++;
            }

            // Copy the sorted elements back into the original array
            for (let i = start; i <= end; i++) {
                arr[i] = tempArray[i];
            }

            // Only push the array state to animations every 10th merge step
            stepCounter++;
            if (stepCounter % 5 === 0) {
                // Ensure this doesn't crash by limiting array size in animations
                if (arr.length <= 100) {
                    animations.push([...arr]); // Capture the array state at this step
                }
            }
        };

        mergeSortHelper(array, 0, array.length - 1); // Initialize the process

        // Add a final update to the animations array to reflect the fully sorted array
        animations.push([...array]); // Final step after all merges are done

        return animations;
    };

    // Handle sorting and visualization
    const handleSort = async () => {
        setIsSorting(true);
        setQuickSortTime(0); // Reset quicksort timer
        setMergeSortTime(0); // Reset mergesort timer

        const startTimeQuickSort = Date.now();
        const startTimeMergeSort = Date.now();

        // Visualize sorting for both quicksort and mergesort
        const visualizeSorting = async (array, setArray, sortFunc, isQuickSort) => {
            const animations = sortFunc(array);
            if (Array.isArray(animations)) {
                for (const step of animations) {
                    if (Array.isArray(step)) {
                        setArray([...step]);
                        await new Promise((resolve) => setTimeout(resolve, isQuickSort ? 10 : 20)); // Adjust speed for quicksort
                    } else {
                        console.error("Step is not an array:", step);
                    }
                }
            } else {
                console.error("Animations is not an array:", animations);
            }

            const endTime = Date.now();
            if (isQuickSort) {
                // Set quicksort timer in microseconds
                setQuickSortTime((endTime - startTimeQuickSort));
            } else {
                // Set mergesort timer in microseconds
                setMergeSortTime((endTime - startTimeMergeSort));
            }
        };

        await Promise.all([
            visualizeSorting(arrayOne, setArrayOne, quickSortWithSteps, true),
            visualizeSorting(arrayTwo, setArrayTwo, mergeSortWithSteps, false),
        ]);

        setIsSorting(false);
    };

    return (
        <div className="sorting-visualizer">
            <div className="controls">
                <div>
                    <h3>Array State</h3>
                    <label>
                        <input
                            type="radio"
                            name="arrayState"
                            value="almostSorted"
                            onChange={() => setArrayState('almostSorted')}
                        />{' '}
                        Almost Sorted
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="arrayState"
                            value="random"
                            onChange={() => setArrayState('random')}
                            defaultChecked
                        />{' '}
                        Random
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="arrayState"
                            value="reversed"
                            onChange={() => setArrayState('reversed')}
                        />{' '}
                        Reversed
                    </label>
                </div>
                <div>
                    <h3>Data Size</h3>
                    <label>
                        <input
                            type="radio"
                            name="dataSize"
                            value="low"
                            onChange={() => setDataSize('low')}
                            defaultChecked
                        />{' '}
                        Low
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="dataSize"
                            value="medium"
                            onChange={() => setDataSize('medium')}
                        />{' '}
                        Medium
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="dataSize"
                            value="high"
                            onChange={() => setDataSize('high')}
                        />{' '}
                        High
                    </label>
                </div>
                <button onClick={handleSort} disabled={isSorting}>
                    {isSorting ? 'Sorting...' : 'Sort'}
                </button>
                {quickSortTime > 0 && !isSorting && (
                    <div className="timer">Quick Sort time: {quickSortTime} μs</div>
                )}
                {mergeSortTime > 0 && !isSorting && (
                    <div className="timer">Merge Sort time: {mergeSortTime} μs</div>
                )}
            </div>
            <div className="sorting-boxes">
                <div className="box">
                    <h4>Quick Sort</h4>
                    <div className="bar-container">
                        {arrayOne.slice(0, 100).map((value, index) => (
                            <div
                                key={index}
                                className="bar"
                                style={{
                                    height: `${(value / Math.max(...arrayOne)) * 100}%`,
                                }}
                            ></div>
                        ))}
                    </div>
                </div>
                <div className="box">
                    <h4>Merge Sort</h4>
                    <div className="bar-container">
                        {arrayTwo.slice(0, 100).map((value, index) => (
                            <div
                                key={index}
                                className="bar"
                                style={{
                                    height: `${(value / Math.max(...arrayTwo)) * 100}%`,
                                }}
                            ></div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SortingVisualizer;
