import { FormEvent, Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XIcon } from "@heroicons/react/outline";
import axios from "axios";
import CreateOpeningOptions from "./CreateOpeningOptions";

const UrlSafeString = require("url-safe-string"),
  tagGenerator = new UrlSafeString();

import useStore from "../utils/store";
export default function CreateOpeningModal() {
  const [opening_name, setOpeningName] = useState("");
  const [is_public, setIsPublic] = useState(false);
  const createOpening = async (e: FormEvent) => {
    e.preventDefault();
    const body: APICreateOpeningInput = {
      opening_name: opening_name,
      is_public: is_public,
    };
    try {
      const { status, data } = await axios.post("/api/openings", body);
      alert(data.message);
      setCreateOpeningModalOpen(false);
    } catch (error) {
      alert(error.response.data.message);
    }
  };

  const open = useStore(
    (state: PlutomiState) => state.createOpeningModalIsOpen
  );

  const setCreateOpeningModalOpen = useStore(
    (state: PlutomiState) => state.setCreateOpeningModalOpen
  );

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 overflow-hidden "
        onClose={() => setCreateOpeningModalOpen(false)}
      >
        <div className="absolute inset-0 overflow-hidden">
          <Transition.Child
            as={Fragment}
            enter="ease-in-out duration-500"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in-out duration-500"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-y-0 pl-16 max-w-full right-0 flex">
            <Transition.Child
              as={Fragment}
              enter="transform transition ease-in-out duration-500 sm:duration-700"
              enterFrom="translate-x-full"
              enterTo="translate-x-0"
              leave="transform transition ease-in-out duration-500 sm:duration-700"
              leaveFrom="translate-x-0"
              leaveTo="translate-x-full"
            >
              <div className="w-screen max-w-md">
                <form
                  className="h-full divide-y divide-gray-200 flex flex-col bg-white shadow-xl"
                  onSubmit={(e) => createOpening(e)}
                >
                  <div className="flex-1 h-0 overflow-y-auto">
                    <div className="py-6 px-4 bg-indigo-700 sm:px-6">
                      <div className="flex items-center justify-between">
                        <Dialog.Title className="text-lg font-medium text-white">
                          New Opening
                        </Dialog.Title>
                        <div className="ml-3 h-7 flex items-center">
                          <button
                            type="button"
                            className="bg-indigo-700 rounded-md text-indigo-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
                            onClick={() => setCreateOpeningModalOpen(false)}
                          >
                            <span className="sr-only">Close panel</span>
                            <XIcon className="h-6 w-6" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                      <div className="mt-1">
                        <p className="text-sm text-indigo-300">
                          An opening is what you need applicants for. It could
                          be a job like &apos;Engineer&apos;, a location like
                          &apos;New York&apos; or &apos;Chicago&apos;, or a
                          program like &apos;Summer Camp&apos;.
                        </p>
                      </div>
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="px-4 divide-y divide-gray-200 sm:px-6">
                        <div className="space-y-6 pt-6 pb-5">
                          <div>
                            <label
                              htmlFor="opening-name"
                              className="block text-sm font-medium text-gray-900"
                            >
                              Opening name
                            </label>
                            <div className="mt-1">
                              <input
                                type="text"
                                name="opening-name"
                                id="opening-name"
                                required
                                onChange={(e) => setOpeningName(e.target.value)}
                                value={opening_name}
                                className="block w-full shadow-sm sm:text-sm focus:ring-indigo-500 focus:border-indigo-500 border-gray-300 rounded-md"
                              />
                            </div>
                          </div>
                          <div className="relative flex items-start">
                            <div className="flex items-center h-5">
                              <input
                                id="comments"
                                aria-describedby="comments-description"
                                name="comments"
                                type="checkbox"
                                checked={is_public}
                                onChange={(e) => setIsPublic(e.target.checked)}
                                className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                              />
                            </div>
                            <div className="ml-3 text-sm">
                              <label
                                htmlFor="comments"
                                className="font-medium text-gray-700"
                              >
                                Public
                              </label>
                              <p
                                id="comments-description"
                                className="text-gray-500"
                              >
                                Make this opening available to everyone once
                                created
                              </p>
                            </div>
                          </div>

                          {/* <div>
                            <label
                              htmlFor="description"
                              className="block text-sm font-medium text-gray-900"
                            >
                              Description
                            </label>
                            <div className="mt-1">
                              <textarea
                                id="description"
                                name="description"
                                rows={4}
                                className="block w-full shadow-sm sm:text-sm focus:ring-indigo-500 focus:border-indigo-500 border border-gray-300 rounded-md"
                                defaultValue={""}
                              />
                            </div>
                          </div> */}
                          {/* <div>
                           <h3 className="text-sm font-medium text-gray-900">
                              Team Members
                            </h3> */}
                          {/* <div className="mt-2">
                              <div className="flex space-x-2">
                                {team.map((person) => (
                                  <a
                                    key={person.email}
                                    href={person.href}
                                    className="rounded-full hover:opacity-75"
                                  >
                                    <img
                                      className="inline-block h-8 w-8 rounded-full"
                                      src={person.imageUrl}
                                      alt={person.name}
                                    />
                                  </a>
                                ))}
                                <button
                                  type="button"
                                  className="flex-shrink-0 bg-white inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-dashed border-gray-200 text-gray-400 hover:text-gray-500 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                  <span className="sr-only">
                                    Add team member
                                  </span>
                                  <PlusSmIcon
                                    className="h-5 w-5"
                                    aria-hidden="true"
                                  />
                                </button>
                              </div>
                            </div>
                          </div> */}
                          {/* <fieldset>
                            <legend className="text-sm font-medium text-gray-900">
                              Privacy
                            </legend>
                            <div className="mt-2 space-y-5">
                              <div className="relative flex items-start">
                                <div className="absolute flex items-center h-5">
                                  <input
                                    id="privacy-public"
                                    name="privacy"
                                    aria-describedby="privacy-public-description"
                                    type="radio"
                                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                                    defaultChecked
                                  />
                                </div>
                                <div className="pl-7 text-sm">
                                  <label
                                    htmlFor="privacy-public"
                                    className="font-medium text-gray-900"
                                  >
                                    Public access
                                  </label>
                                  <p
                                    id="privacy-public-description"
                                    className="text-gray-500"
                                  >
                                    Everyone with the link will see this
                                    project.
                                  </p>
                                </div>
                              </div>
                              <div>
                                <div className="relative flex items-start">
                                  <div className="absolute flex items-center h-5">
                                    <input
                                      id="privacy-private-to-project"
                                      name="privacy"
                                      aria-describedby="privacy-private-to-project-description"
                                      type="radio"
                                      className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                                    />
                                  </div>
                                  <div className="pl-7 text-sm">
                                    <label
                                      htmlFor="privacy-private-to-project"
                                      className="font-medium text-gray-900"
                                    >
                                      Private to project members
                                    </label>
                                    <p
                                      id="privacy-private-to-project-description"
                                      className="text-gray-500"
                                    >
                                      Only members of this project would be able
                                      to access.
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <div>
                                <div className="relative flex items-start">
                                  <div className="absolute flex items-center h-5">
                                    <input
                                      id="privacy-private"
                                      name="privacy"
                                      aria-describedby="privacy-private-to-project-description"
                                      type="radio"
                                      className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                                    />
                                  </div>
                                  <div className="pl-7 text-sm">
                                    <label
                                      htmlFor="privacy-private"
                                      className="font-medium text-gray-900"
                                    >
                                      Private to you
                                    </label>
                                    <p
                                      id="privacy-private-description"
                                      className="text-gray-500"
                                    >
                                      You are the only one able to access this
                                      project.
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </fieldset> 
                          </div>*/}
                          {/* <div className="pt-4 pb-6">
                          <div className="flex text-sm">
                            <a
                              href="#"
                              className="group inline-flex items-center font-medium text-indigo-600 hover:text-indigo-900"
                            >
                              <LinkIcon
                                className="h-5 w-5 text-indigo-500 group-hover:text-indigo-900"
                                aria-hidden="true"
                              />
                              <span className="ml-2">Copy link</span>
                            </a>
                          </div>
                          <div className="mt-4 flex text-sm">
                            <a
                              href="#"
                              className="group inline-flex items-center text-gray-500 hover:text-gray-900"
                            >
                              <QuestionMarkCircleIcon
                                className="h-5 w-5 text-gray-400 group-hover:text-gray-500"
                                aria-hidden="true"
                              />
                              <span className="ml-2">
                                Learn more about sharing
                              </span>
                            </a>
                          </div> */}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex-shrink-0 px-4 py-4 flex justify-end">
                    <button
                      type="button"
                      className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      onClick={() => setCreateOpeningModalOpen(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="ml-4 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Create Opening
                    </button>
                  </div>
                </form>
              </div>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}