import { Fragment } from 'react'
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from '@headlessui/react'
import { EllipsisHorizontalIcon } from '@heroicons/react/20/solid'
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/20/solid'
  const statuses = {
    Paid: 'text-green-700 bg-green-50 ring-green-600/20',
    Withdraw: 'text-gray-600 bg-gray-50 ring-gray-500/10',
    Overdue: 'text-red-700 bg-red-50 ring-red-600/10',
  }
  const clients = [
    {
      id: 1,
      name: 'Tuple',
      imageUrl: 'https://tailwindui.com/img/logos/48x48/tuple.svg',
      lastInvoice: { date: 'December 13, 2022', dateTime: '2022-12-13', amount: '$2,000.00', status: 'Overdue' },
    },
    {
      id: 2,
      name: 'SavvyCal',
      imageUrl: 'https://tailwindui.com/img/logos/48x48/savvycal.svg',
      lastInvoice: { date: 'January 22, 2023', dateTime: '2023-01-22', amount: '$14,000.00', status: 'Paid' },
    },
    {
      id: 3,
      name: 'Reform',
      imageUrl: 'https://tailwindui.com/img/logos/48x48/reform.svg',
      lastInvoice: { date: 'January 23, 2023', dateTime: '2023-01-23', amount: '$7,600.00', status: 'Paid' },
    },
  ]

  function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
  }

export default function ProductGrid() {
  return (
    <ul role="list" className="grid grid-cols-1 gap-x-6 gap-y-8 lg:grid-cols-3 xl:gap-x-8">
      {clients.map((client) => (
        <li key={client.id} className="overflow-hidden rounded-xl border border-gray-200">
          <div className="flex w-full items-center justify-between space-x-6 p-6">
                <div className="flex-1 truncate">
                  <div className="flex item-center space-x-5">
                    <h3 className="truncate text-xl font-semibold text-gray-900">
                      {client.name}
                    </h3>

                    <span className="inline-flex flex-shrink-0 items-center rounded-full bg-yellow-50 px-2 py-0.5 text-xs font-medium text-yellow-700 ring-1 ring-inset ring-yellow-600/20">
                      {client.lastInvoice.amount}
                    </span>
                  </div>

                  <div className="py-3 flex justify-start text-gray-700 font-semibold">
                    <span className="border-2 border-gray-400 p-1 bg-gray-50 inline-block rounded-md">
                      Salary: {client.lastInvoice.amount}
                    </span>
                  </div>
                  <p className="truncate text-base text-gray-500">
                    Teast
                  </p>
                  <p className="font-medium mt-1 text-sm leading-6 text-gray-700">
                    Test
                  </p>
                  <p className="font-medium mt-1 text-base leading-6 text-blue-700">
                    test
                  </p>
                </div>
                <img
                  className="h-10 w-10 flex-shrink-0 rounded-full bg-gray-300"
                  src=""
                  alt=""
                />
              </div>

              <div>
                <div className="-mt-px flex">
                  <div className="flex w-0 flex-1">
                    <a
                      href={`mailto:`}
                      className="relative -mr-px inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-bl-lg border border-transparent py-4 text-sm font-semibold text-gray-900"
                    >
                      <ArrowTopRightOnSquareIcon
                        className="h-6 w-5 text-gray-400"
                        aria-hidden="true"
                      />
                      Get more details
                    </a>
                  </div>
                </div>
              </div>

        </li>
      ))}
    </ul>
  )
}
