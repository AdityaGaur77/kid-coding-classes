package org.firstinspires.ftc.teamcode;
import androidx.annotation.NonNull;
import com.acmerobotics.dashboard.config.Config;
import com.acmerobotics.dashboard.telemetry.TelemetryPacket;
import com.acmerobotics.roadrunner.Action;
import com.acmerobotics.roadrunner.Pose2d;
import com.acmerobotics.roadrunner.SequentialAction;
import com.acmerobotics.roadrunner.TrajectoryActionBuilder;
import com.acmerobotics.roadrunner.Vector2d;
import com.acmerobotics.roadrunner.ftc.Actions;
import com.qualcomm.robotcore.eventloop.opmode.Autonomous;
import com.qualcomm.robotcore.eventloop.opmode.LinearOpMode;
import com.qualcomm.robotcore.hardware.DcMotor;
import com.qualcomm.robotcore.hardware.DcMotorEx;
import org.firstinspires.ftc.teamcode.MecanumDrive;

import com.qualcomm.robotcore.hardware.DcMotorSimple;
import com.qualcomm.robotcore.hardware.HardwareMap;
import com.qualcomm.robotcore.hardware.Servo;

@Autonomous(name = "BLUE_TEST_AUTO_PIXEL", group = "Autonomous")
public class SmoothAutoPath extends LinearOpMode {


    @Override
    public void runOpMode() {
        Pose2d initialPose = new Pose2d(0, -70, Math.toRadians(90));
        MecanumDrive drive = new MecanumDrive(hardwareMap, initialPose);


        TrajectoryActionBuilder tab1 = drive.actionBuilder(initialPose)
                .splineTo(new Vector2d(0, -31), Math.toRadians(90))
                .splineTo(new Vector2d(37, -34), Math.toRadians(0))
                .splineTo(new Vector2d(37, -10), Math.toRadians(90))

                // First pixel drop sequence
                .splineTo(new Vector2d(47, -10), Math.toRadians(0))
                .splineTo(new Vector2d(47, -50), Math.toRadians(-90))
                .splineTo(new Vector2d(47, -10), Math.toRadians(90))

                // Second pixel drop sequence
                .splineTo(new Vector2d(57, -10), Math.toRadians(0))
                .splineTo(new Vector2d(57, -50), Math.toRadians(-90))
                .splineTo(new Vector2d(57, -10), Math.toRadians(90))

                // Third pixel drop sequence
                .splineTo(new Vector2d(67, -10), Math.toRadians(0))
                .splineTo(new Vector2d(67, -50), Math.toRadians(-90))

                // Cycling sequence (repeated 4 times)
                .splineTo(new Vector2d(46.9, -49.7), Math.toRadians(180))
                .turn(Math.toRadians(180))
                .splineTo(new Vector2d(0, -34), Math.toRadians(180))
                .splineTo(new Vector2d(0, -31), Math.toRadians(90))

                // Repeat the cycle 3 more times
                .splineTo(new Vector2d(46.9, -49.7), Math.toRadians(0))
                .turn(Math.toRadians(180))
                .splineTo(new Vector2d(0, -34), Math.toRadians(180))
                .splineTo(new Vector2d(0, -31), Math.toRadians(90))

                .splineTo(new Vector2d(46.9, -49.7), Math.toRadians(0))
                .turn(Math.toRadians(180))
                .splineTo(new Vector2d(0, -34), Math.toRadians(180))
                .splineTo(new Vector2d(0, -31), Math.toRadians(90))

                .splineTo(new Vector2d(46.9, -49.7), Math.toRadians(0))
                .turn(Math.toRadians(180))
                .splineTo(new Vector2d(0, -34), Math.toRadians(180))
                .splineTo(new Vector2d(0, -31), Math.toRadians(90))

                // Final parking
                .splineTo(new Vector2d(46.9, -60), Math.toRadians(0));



        while (!isStopRequested() && !opModeIsActive()) {
            telemetry.addData("Position during Init",0);
            telemetry.update();
        }

        waitForStart();

        if (isStopRequested()) return;


        Actions.runBlocking(
                tab1.build()
        );
    }
}