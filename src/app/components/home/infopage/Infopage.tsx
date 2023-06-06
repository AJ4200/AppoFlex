import React from "react";
import Splashbackground from "../../splash/Splashbackground";

const Infopage: React.FC = () => {
  return (
    <>
      <Splashbackground />
      <section className="infopage">
        <h1>Welcome to AppoFlex</h1>
        <p className="typingeffect">
          AppoFlex is a dynamic and flexible appointment management system designed for clients and service providers, such as hairdressers. Our platform revolutionizes the way appointments are handled, ensuring a seamless experience for both parties. With AppoFlex, you no longer need to worry about overlapping appointments. Our intelligent system understands the time required for each service, allowing you to allocate the appropriate duration to each appointment. This way, you can provide your full attention to every client without rushing. Say goodbye to missed appointments! AppoFlex sends real-time alerts and notifications to clients and service providers, ensuring everyone stays informed about any changes. If a previous appointment runs longer than expected, the system automatically alerts the next customer, suggesting the next available time slot. We understand that life can be unpredictable. AppoFlex offers flexibility to reschedule or modify appointments with ease. Our user-friendly interface allows both clients and service providers to manage their schedules effortlessly, saving time and minimizing disruptions. AppoFlex facilitates seamless communication between clients and service providers. Need to discuss specific requirements or preferences? Our platform provides a convenient messaging system, ensuring effective communication before, during, and after appointments. Ready to streamline your appointment management process? Join AppoFlex and discover the power of flexible scheduling, real-time alerts, and effortless communication. Say goodbye to scheduling conflicts and hello to a more efficient and satisfying experience for both clients and service providers.
        </p>
      </section>
    </>
  );
}

export default Infopage;
