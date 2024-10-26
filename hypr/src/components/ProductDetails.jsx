import { PaperClipIcon } from "@heroicons/react/20/solid";

export default function Example() {
  return (
    <div className="flex justify-start">
      <div className="overflow-hidden bg-gray-850 shadow sm:rounded-lg border-2 border-gray-500 scale-90 w-1/2 mx-auto">
        <div className="px-4 py-6 sm:px-6">
          <h3 className="text-base font-semibold leading-7 text-white">
            Applicant Information
          </h3>
          <p className="mt-1 max-w-sm text-sm leading-6 text-gray-400">
            Personal details and application.
          </p>
        </div>
        <div className="border-t border-gray-100">
          <dl className="divide-y divide-gray-100">
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-white">Full name</dt>
              <dd className="mt-1 text-sm leading-6 text-white sm:col-span-2 sm:mt-0">
                Margot Foster
              </dd>
            </div>
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-900">
                Application for
              </dt>
              <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                Backend Developer
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}