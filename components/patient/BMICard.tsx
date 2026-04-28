import React from 'react';
import Card from '../common/Card';
import Icon from '../common/Icon';
import Button from '../common/Button';

interface BMICardProps {
    weight?: number; // in kg
    height?: number; // in cm
    onEdit?: () => void;
}

const BMICard: React.FC<BMICardProps> = ({ weight, height, onEdit }) => {
    const calculateBMI = () => {
        if (height && weight && height > 0) {
            const heightInMeters = height / 100;
            return parseFloat((weight / (heightInMeters * heightInMeters)).toFixed(1));
        }
        return null;
    };

    const bmi = calculateBMI();

    const getBMIDetails = () => {
        if (bmi === null) {
            return {
                category: "Not Available",
                description: "Update your profile with your current weight and height to calculate your BMI.",
                color: "text-gray-500",
                bgColor: "bg-gray-100",
                indicatorPosition: '0%',
            };
        }

        if (bmi < 18.5) {
            return {
                category: "Underweight",
                description: "You may be underweight. It's good to consult your dietician to ensure you're getting enough nutrients.",
                color: "text-blue-600",
                bgColor: "bg-blue-100",
                indicatorPosition: '12.5%',
            };
        } else if (bmi >= 18.5 && bmi < 25) {
            return {
                category: "Normal weight",
                description: "You are within the healthy weight range. Keep up the great work with your diet and exercise!",
                color: "text-green-600",
                bgColor: "bg-green-100",
                indicatorPosition: '37.5%',
            };
        } else if (bmi >= 25 && bmi < 30) {
            return {
                category: "Overweight",
                description: "You are in the overweight range. Your dietician can help you with a plan to reach a healthier weight.",
                color: "text-yellow-600",
                bgColor: "bg-yellow-100",
                indicatorPosition: '62.5%',
            };
        } else { // bmi >= 30
            return {
                category: "Obesity",
                description: "You are in the obesity range. It's important to work with your dietician on a sustainable health plan.",
                color: "text-red-600",
                bgColor: "bg-red-100",
                indicatorPosition: '87.5%',
            };
        }
    };

    const bmiDetails = getBMIDetails();

    const cardActions = onEdit ? (
        <Button variant="ghost" size="sm" onClick={onEdit}>Edit Profile</Button>
    ) : undefined;

    return (
        <Card title="Your Body Mass Index (BMI)" icon={<Icon name="chart" className="h-5 w-5" />} actions={cardActions}>
            <div className="text-center">
                <p className="text-4xl font-bold text-gray-800">{bmi ?? '--.-'}</p>
                <p className={`mt-1 font-semibold text-lg ${bmiDetails.color}`}>{bmiDetails.category}</p>
            </div>
            
            <div className="mt-4">
                <div className="relative h-2 w-full bg-gray-200 rounded-full">
                    <div className="absolute h-2 rounded-full bg-gradient-to-r from-blue-400 via-green-400 to-yellow-400 w-full"></div>
                    {bmi !== null && (
                         <div className="absolute top-1/2 -translate-y-1/2 transform -translate-x-1/2 transition-all duration-500" style={{ left: bmiDetails.indicatorPosition }}>
                           <div className="w-4 h-4 rounded-full bg-white border-2 border-primary-600 shadow-md"></div>
                        </div>
                    )}
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span className="w-1/4 text-center">Underweight</span>
                    <span className="w-1/4 text-center">Normal</span>
                    <span className="w-1/4 text-center">Overweight</span>
                    <span className="w-1/4 text-center">Obesity</span>
                </div>
            </div>

            <div className={`mt-4 p-3 rounded-lg ${bmiDetails.bgColor}`}>
                <p className={`text-sm ${bmiDetails.color}`}>{bmiDetails.description}</p>
            </div>
        </Card>
    );
};

export default BMICard;