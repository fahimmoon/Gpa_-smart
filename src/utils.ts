import { Course, GRADE_SCALE, Semester } from './types';

export const calculateSemesterGPA = (courses: Course[]): number => {
  const gradedCourses = courses.filter(c => c.grade !== '');
  if (gradedCourses.length === 0) return 0;

  const totalPoints = gradedCourses.reduce((sum, c) => {
    const gradeValue = GRADE_SCALE[c.grade as keyof typeof GRADE_SCALE] || 0;
    return sum + (gradeValue * c.credits);
  }, 0);

  const totalCredits = gradedCourses.reduce((sum, c) => sum + c.credits, 0);
  return totalCredits === 0 ? 0 : totalPoints / totalCredits;
};

export const calculateOverallCGPA = (semesters: Semester[]): {
  cgpa: number;
  totalCredits: number;
  totalPoints: number;
} => {
  let totalPoints = 0;
  let totalCredits = 0;

  semesters.forEach(sem => {
    sem.courses.forEach(course => {
      if (course.grade !== '') {
        const gradeValue = GRADE_SCALE[course.grade as keyof typeof GRADE_SCALE] || 0;
        totalPoints += gradeValue * course.credits;
        totalCredits += course.credits;
      }
    });
  });

  return {
    cgpa: totalCredits === 0 ? 0 : totalPoints / totalCredits,
    totalCredits,
    totalPoints
  };
};

export const getNextSemesterName = (currentName: string): string => {
  const [term, yearStr] = currentName.split(' ');
  let year = parseInt(yearStr);

  if (term === 'Fall') {
    return `Spring ${year + 1}`;
  } else if (term === 'Spring') {
    return `Fall ${year}`;
  } else if (term === 'Summer') {
    return `Fall ${year}`;
  }
  
  return `Semester ${Date.now()}`;
};

export const percentageToGrade = (percentage: number): keyof typeof GRADE_SCALE => {
  if (percentage >= 90) return 'A+';
  if (percentage >= 85) return 'A';
  if (percentage >= 80) return 'A-';
  if (percentage >= 75) return 'B+';
  if (percentage >= 70) return 'B';
  if (percentage >= 65) return 'B-';
  if (percentage >= 60) return 'C+';
  if (percentage >= 55) return 'C';
  if (percentage >= 50) return 'C-';
  if (percentage >= 45) return 'D+';
  if (percentage >= 40) return 'D';
  if (percentage >= 35) return 'D-';
  return 'F';
};
