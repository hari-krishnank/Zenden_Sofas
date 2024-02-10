const inputs = document.querySelectorAll("input");
const button = document.querySelector(".btn");

// iterate over all inputs
inputs.forEach((input, index1) => {
  input.addEventListener("keyup", (e) => {
    // This code gets the current input element and stores it in the currentInput variable
    // This code gets the next sibling element of the current input element and stores it in the nextInput variable
    // This code gets the previous sibling element of the current input element and stores it in the prevInput variable
    const currentInput = input; // current input element
    const nextInput = input.nextElementSibling; // next input element sibling
    const prevInput = input.previousElementSibling; // prev input element sibling

    // if the value has more than one character then clear it
    if (currentInput.value.length > 1) {
      currentInput.value = "";
      return;
    }
    // if the next input is disabled and the current value is not empty
    //  enable the next input and focus on it
    if (nextInput && nextInput.hasAttribute("disabled") && currentInput.value !== "") {
      nextInput.removeAttribute("disabled");
      nextInput.focus();
    }

    // if the backspace key is pressed
    if (e.key === "Backspace") {
      // iterate over all inputs again
      inputs.forEach((input, index2) => {
        // if the index1 of the current input is less than or equal to the index2 of the input in the outer loop
        // and the previous element exists, set the disabled attribute on the input and focus on the previous element
        if (index1 <= index2 && prevInput) {
          input.setAttribute("disabled", true);
          input.value = "";
          prevInput.focus();
        }
      });
    }
    //if the fourth input( which index number is 3) is not empty and has not disable attribute then
    //add active class if not then remove the active class.
    if (!inputs[3].disabled && inputs[3].value !== "") {
      button.classList.add("active");
      return;
    }
    button.classList.remove("active");
  });
});

//focus the first input which index is 0 on window load
window.addEventListener("load", () => inputs[0].focus());

document.addEventListener("DOMContentLoaded", function() {
  const resendLink = document.getElementById("resendLink");
  const countdownSpan = document.getElementById("countdown");
  let countdownValue = 120;
  let timer;

  // Function to update countdown timer
  function updateCountdown() {
      const minutes = Math.floor(countdownValue / 60);
      const seconds = countdownValue % 60;

      // Display the countdown in minutes:seconds format
      countdownSpan.textContent = `RESEND OTP IN - ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
      countdownValue--;

      if (countdownValue < 0) {
          clearInterval(timer);
          countdownSpan.textContent = "";
          resendLink.style.display = "inline"; 
      }
  }

  // Start countdown timer
  function startCountdown() {
      updateCountdown();
      timer = setInterval(updateCountdown, 1000);
  }

  // Call startCountdown to begin the countdown immediately
  startCountdown();

  // Event listener for Resend OTP link
  resendLink.addEventListener("click", async function(event) {
      event.preventDefault();

      // Disable the "Resend OTP" link and start the countdown
      resendLink.disabled = true;
      countdownValue = 120;
      clearInterval(timer);
      startCountdown();

      const emailInput = document.querySelector("input[name='email']");
      const email = emailInput.value;

      try {
          const response = await fetch("/resendOtp", {
              method: "POST",
              headers: {
                  "Content-Type": "application/json"
              },
              body: JSON.stringify({ email })
          });

          if (!response.ok) {
              throw new Error("Failed to resend OTP");
          }

          displayToasterMessage("OTP resent successfully"); // Display toaster message on success

          resendLink.style.display = "none";
      } catch (error) {
          console.error("Error resending OTP:", error.message);
          displayToasterMessage("Failed to resend OTP. Please try again later.", true); // Display toaster message on error

          clearInterval(timer);
          countdownSpan.textContent = "";
          resendLink.style.display = "none"; 
      }
  });

  // Function to display toaster messages
  function displayToasterMessage(message, isError = false) {
      const toaster = document.getElementById("toaster");
      toaster.textContent = message;
      toaster.classList.toggle("error", isError);
      toaster.classList.add("show");

      // Hide the toaster message after a few seconds
      setTimeout(() => {
          toaster.classList.remove("show");
      }, 5000); // 5000 milliseconds (5 seconds)
  }
});



