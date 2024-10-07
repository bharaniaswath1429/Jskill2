import { IoBarChartSharp } from 'react-icons/io5';
import { MdQueryStats } from 'react-icons/md';
import { FaWpforms } from 'react-icons/fa';
import { ImProfile } from 'react-icons/im';

const adminlinks = [
  { id: 1, text: 'stats', path: '/admin', icon: <IoBarChartSharp /> },
  { id: 2, text: 'training', path: 'training', icon: <MdQueryStats /> },
  { id: 3, text: 'employee', path: 'manageemployee', icon: <FaWpforms /> },
  { id: 4, text: 'profile', path: 'profile', icon: <ImProfile /> },
];

const managerlinks = [
  { id: 1, text: 'stats', path: '/manager', icon: <IoBarChartSharp /> },
  { id: 2, text: 'feedback', path: 'feedback', icon: <MdQueryStats /> },
  { id: 3, text: 'profile', path: 'profile', icon: <ImProfile /> },
];

const employeelinks = [
  { id: 1, text: 'stats', path: '/employee', icon: <IoBarChartSharp /> },
  { id: 2, text: 'course', path: 'course', icon: <MdQueryStats /> },
  { id: 3, text: 'profile', path: 'profile', icon: <ImProfile /> },
];

export {adminlinks, managerlinks, employeelinks};
