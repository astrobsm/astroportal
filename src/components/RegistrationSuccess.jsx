import React from 'react';
import { CheckCircle, Clock, Mail } from 'lucide-react';

const RegistrationSuccess = ({ user, onBackToLogin }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Registration Successful!
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Your account has been created and is pending approval
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="space-y-4">
            <div className="flex items-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <Clock className="h-5 w-5 text-yellow-600 mr-3" />
              <div>
                <h3 className="font-medium text-yellow-800">Awaiting Admin Approval</h3>
                <p className="text-sm text-yellow-700">
                  Your account is currently pending approval by an administrator. 
                  You will receive an email notification once your account is approved.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-medium text-gray-900">Account Details:</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  <span>{user?.email}</span>
                </div>
                <div>
                  <span className="font-medium">Name:</span> {user?.first_name} {user?.last_name}
                </div>
                <div>
                  <span className="font-medium">Role:</span> {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                </div>
                <div>
                  <span className="font-medium">Status:</span> 
                  <span className="ml-1 px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                    Pending Approval
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h3 className="font-medium text-blue-800 mb-2">What happens next?</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• An administrator will review your registration</li>
                <li>• You'll receive an email when your account is approved</li>
                <li>• Once approved, you can log in to access your dashboard</li>
                {user?.role === 'manager' && (
                  <li>• You'll be able to manage order deliveries and track activities</li>
                )}
                {user?.role === 'marketer' && (
                  <li>• You'll be able to manage customer interactions and marketing activities</li>
                )}
              </ul>
            </div>
          </div>
        </div>

        <div className="text-center space-y-4">
          <button
            onClick={onBackToLogin}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-green hover:bg-light-green focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-green"
          >
            Back to Login
          </button>
          
          <div className="text-sm text-gray-500">
            <p>
              Need help? Contact your administrator or 
              <a href="mailto:admin@astro-bsm.com" className="text-primary-green hover:text-light-green ml-1">
                admin@astro-bsm.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationSuccess;
