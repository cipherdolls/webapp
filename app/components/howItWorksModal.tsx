import * as Dialog from "@radix-ui/react-dialog";

const HowItWorksModal = () => {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button className="underline text-body-md">How It Works</button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="sm:bg-transparent bg-neutral-02 fixed inset-0 pointer-events-none">
          <div
            className="absolute left-1/2 -translate-x-1/2
        w-[375px] h-[514px] sm:w-[480px] sm:h-[538px] 
        bottom-0 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2
        rounded-xl pointer-events-none sm:block hidden"
          />
          <div
            className="absolute inset-0 bg-gradient-to-b from-neutral-02 to-neutral-02 sm:block hidden
        [mask-image:linear-gradient(to_bottom,black_0%,black_100%),linear-gradient(to_right,black_0%,black_100%)] 
        [mask-size:100%_100%,480px_538px] 
        [mask-position:0_0,50%_50%] 
        [mask-repeat:no-repeat] 
        [mask-composite:exclude]"
            style={{
              maskImage:
                "linear-gradient(to bottom, black 0%, black 100%), url(\"data:image/svg+xml,%3Csvg width='480' height='538' viewBox='0 0 480 538' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='480' height='538' rx='12' fill='black'/%3E%3C/svg%3E\")",
            }}
          />
        </Dialog.Overlay>

        <Dialog.Content className="fixed left-1/2 bottom-0 sm:bottom-auto sm:top-1/2 -translate-x-1/2 sm:-translate-y-1/2 focus:outline-none max-w-[480px] bg-[linear-gradient(86.23deg,rgba(254,253,248,0.56)_0%,rgba(255,255,255,0.56)_100%)] w-full rounded-xl sm:py-8 py-9 sm:px-12 px-[18px] shadow-bottom backdrop-blur-lg z-20">
          <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-neutral-03 rounded-full w-16 h-1 sm:hidden" />
          <div className="flex flex-col sm:gap-[18px] gap-3">
            <div className="sm:text-heading-h1 text-heading-h2 text-center">
              🥷
            </div>
            <div className="flex flex-col gap-2">
              <h2 className="sm:text-heading-h2 text-heading-h3 text-base-black text-center">
                How it Works
              </h2>
              <p className="sm:text-center sm:text-body-lg text-body-md text-base-black">
                At Cipherdolls, we understand the importance of privacy and
                security. That's why we operate anonymously, without collecting
                any personal data about you. You don't need to provide an email
                address or credit card information to use our services. <br />{" "}
                <br />
                This is also why we use Ethereum on Optimism to pay for
                messages, ensuring that all transactions are secure and private.
                There are no monthly subscriptions or hidden fees. You only pay
                for the messages you send and receive, so if you don't use
                cipherdolls, you don't need to pay a thing.
              </p>
            </div>
            <Dialog.Close asChild className="sm:hidden block sm:mt-0 mt-[18px]">
              <button className="bg-neutral-04 rounded-full w-full text-body-md font-semibold text-base-black py-3.5 focus:outline-0">
                Got It
              </button>
            </Dialog.Close>
          </div>
          <Dialog.Close asChild>
            <button
              className="absolute focus:outline-none -right-14 top-0 size-10 bg-white rounded-full sm:flex hidden items-center justify-center"
              aria-label="Close"
            >
              {/* TODO: Replace the svg with an icon */}
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M5.531 5.46834C5.82463 5.17618 6.2995 5.17737 6.59166 5.471L12 10.9065L17.4083 5.471C17.7005 5.17737 18.1754 5.17618 18.469 5.46834C18.7626 5.7605 18.7638 6.23537 18.4717 6.529L13.058 11.9698L18.5317 17.471C18.8238 17.7646 18.8226 18.2395 18.529 18.5317C18.2354 18.8238 17.7605 18.8226 17.4683 18.529L12 13.0332L6.53166 18.529C6.2395 18.8226 5.76463 18.8238 5.471 18.5317C5.17737 18.2395 5.17618 17.7646 5.46834 17.471L10.942 11.9698L5.52834 6.529C5.23618 6.23537 5.23737 5.7605 5.531 5.46834Z"
                  fill="black"
                />
              </svg>
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default HowItWorksModal;
