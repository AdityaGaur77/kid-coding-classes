package org.firstinspires.ftc.teamcode;

import com.qualcomm.robotcore.eventloop.opmode.LinearOpMode;
import com.qualcomm.robotcore.eventloop.opmode.TeleOp;
import com.qualcomm.robotcore.hardware.DcMotor;
import com.qualcomm.robotcore.hardware.DcMotorEx;
import com.qualcomm.robotcore.util.ElapsedTime;

@TeleOp(name="Motor Encoder Test", group="Diagnostics")
public class MotorEncoderTest extends LinearOpMode {
    // Declare motor
    private DcMotorEx testMotor;

    // Elapsed time for tracking
    private ElapsedTime runtime = new ElapsedTime();

    @Override
    public void runOpMode() {
        // Initialize the motor
        // Replace "motorName" with the actual name you configured in the Robot Controller
        testMotor = (DcMotorEx) hardwareMap.dcMotor.get("motorName");

        // Reset encoder
        testMotor.setMode(DcMotor.RunMode.STOP_AND_RESET_ENCODER);

        // Set to use encoder
        testMotor.setMode(DcMotor.RunMode.RUN_USING_ENCODER);

        // Optional: Set zero power behavior
        testMotor.setZeroPowerBehavior(DcMotor.ZeroPowerBehavior.BRAKE);

        // Telemetry instructions
        telemetry.addData(">", "Press PLAY to start motor encoder test");
        telemetry.update();

        // Wait for start
        waitForStart();

        // Test sequence
        while (opModeIsActive()) {
            // Run motor at different speeds
            testMotorAtSpeed(0.3);  // 30% power
            sleep(2000);  // Run for 2 seconds

            testMotorAtSpeed(-0.3);  // Reverse at 30% power
            sleep(2000);  // Run for 2 seconds

            // Stop motor
            testMotor.setPower(0);

            // Display encoder information
            displayEncoderInfo();

            // Wait before repeating or ending
            sleep(3000);

            // Optional: Break the loop after one test cycle
            break;
        }
    }

    // Method to test motor at a specific speed
    private void testMotorAtSpeed(double power) {
        testMotor.setPower(power);

        telemetry.addData("Motor Speed", "%f", power);
        telemetry.addData("Current Position", "%d", testMotor.getCurrentPosition());
        telemetry.update();
    }

    // Method to display encoder details
    private void displayEncoderInfo() {
        telemetry.addData("Encoder Position", testMotor.getCurrentPosition());
        telemetry.addData("Encoder Velocity", testMotor.getVelocity());
        telemetry.update();
    }
}