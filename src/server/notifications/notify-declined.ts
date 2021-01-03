import _ from 'lodash';
import { managementClient } from '../auth/node-auth0';
import { Ride } from '../../common/model';
import sendEmail from './send-email';

export default async function notifyDeclined(ride: Ride) {
  const driver = await managementClient.getUser({
    id: ride.driver.id,
  });
  const facilitators = await managementClient.getUsersByEmail(
    ride.facilitatorEmail
  );
  const facilitator = facilitators.length > 0 ? facilitators[0] : undefined;

  console.log(
    `Sending declined notification to ${ride.facilitatorEmail} for ride ${ride.id}`
  );

  await sendEmail({
    to: ride.facilitatorEmail,
    subject: `Hills Carpal ride for ${ride.client.name} has been withdrawn from by ${ride.driver.name}`,
    html: `
          <p>Hi ${
            facilitator
              ? facilitator.given_name || facilitator.nickname || ''
              : ''
          },</p>

          <p>
            The ride for ${ride.client.name} from
            ${ride.locationFrom.placeName} to ${ride.locationTo.placeName} at 
            ${ride.pickupTimeAndDate} has been withdrawn from. This means
            that it's available for other drivers to pick up.
          </p>
  
          <p>To view the ride, <a href="${
            process.env.EXTERNAL_URL
          }/facilitator/rides/${ride.id}">click here</a>.</p>
 
          <p>
            Thanks,<br>
            Hills Carpal
          </p>
       `,
  });
}
